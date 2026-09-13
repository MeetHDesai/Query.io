import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseService } from '@/lib/supabase';
import { getCompletion } from '@/lib/openai';
import { getDatabaseSchema, executeQueryService } from '@/lib/queryService';
import { logger } from '@/lib/logger';
import { QueryError, safelyParseJson } from '@/lib/utils';

// --- Interfaces ---

interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Expected JSON structure from the AI
interface AiResponseJson {
  sql: string;
  chartType: "line" | "bar" | "pie" | "area" | "radar" | "radial" | "table";
  title: string;
  description: string; // This is the explanation for the chart/table
}

// Final response structure for the frontend
interface QueryResult {
  chartType?: "line" | "bar" | "pie" | "area" | "radar" | "radial" | "table";
  data: any[];
  columns: string[];
  sql: string;
  title?: string;
  description?: string; // Explanation displayed below the chart
  error?: string; // Field to communicate errors to the frontend
}

// --- AI Prompt Builder ---

async function buildAiPrompt(query: string, connectionId: string): Promise<PromptMessage[]> {
  try {
    const schema = await getDatabaseSchema(connectionId);

    const systemPrompt: PromptMessage = {
      role: "system",
      content: `You are QueryIO, an expert PostgreSQL database and visualization assistant. Your primary goal is to convert natural language queries into SQL, determine the best visualization for the results, generate a title and a brief explanation, and return a structured JSON response.

Available Chart Types: area, bar, line, pie, radar, radial, table

Database Schema:
${schema}

USER QUERY: "${query}"

// --- CORE INSTRUCTIONS ---
ALWAYS follow these rules meticulously:

1.  **Analyze User Intent:** Carefully understand the user's query ("${query}") and the provided database schema.
2.  **Generate PostgreSQL SELECT Statement:**
    * Create a single, valid PostgreSQL SELECT statement. **ONLY SELECT statements.** Modifying statements (INSERT, UPDATE, DELETE, etc.) are forbidden.
    * **SQL Patterns & Case Handling:**
        * Use \`ILIKE\` for case-insensitive string matching in WHERE clauses on user-provided text values, unless the user explicitly requests case sensitivity.
        * Assume table and column names from the schema are case-sensitive if quoted, otherwise follow PostgreSQL's standard case-insensitivity for unquoted identifiers.
        * Generate robust SQL considering NULLs (e.g., using \`COALESCE\`, \`IS NULL\`).
    * **Data Suitability for Chart:** The SELECT statement MUST retrieve data appropriate for the chosen \`chartType\` (see Rule #3).
    * **Limit Results:** Unless the query implies a small, aggregated result set (e.g., complex GROUP BY returning few unique groups) or the user explicitly asks for all data or a different limit, **append 'LIMIT 100'** to the end of the SELECT statement to prevent overly large results.
3.  **Determine Visualization Type (\`chartType\`):**
    * Analyze the query and the structure of the likely SQL results. Choose the MOST appropriate type from: "area", "bar", "line", "pie", "radar", "radial", "table".
    * **PRIORITIZE CHART OUTPUTS:** Default to a chart type unless it's clearly unsuitable for the data that can be selected.
    * **Choose Appropriately based on Data Requirements:**
        * \`line\`: Trends over time/sequence. Requires >= 1 temporal/sequential/ordered column (X-axis) and >= 1 quantitative column (Y-axis).
        * \`area\`: Volume/cumulative totals over time/sequence; stacked trends. Similar data requirements to \`line\`.
        * \`bar\`: Comparing values across distinct categories. Requires >= 1 categorical column (X-axis) and >= 1 quantitative column (Y-axis).
        * \`pie\`: Part-to-whole composition for a *small number* of categories (ideally < 7). Requires 1 categorical column and 1 quantitative column.
        * \`radar\`: Comparing multiple (>= 3) quantitative variables (axes) for different subjects/groups (categories). Requires 1 categorical column and >= 3 quantitative columns.
        * \`radial\`: Displaying values/progress circularly, often for single values or simple comparisons. Can vary, often 1 categorical and 1 quantitative.
    * **Use "table" ONLY If:** No other chart type is suitable for the data retrieved, the user explicitly asks for raw data, or only non-quantitative data can be selected based on the query and schema.
4.  **Generate Title (\`title\`):** Create a concise, descriptive title for the chart or table (e.g., "Monthly Sales Trend", "User Count by Country").
5.  **Generate Description (\`description\`):** Provide a brief (1-2 sentences) **explanation** of what the chart or table shows. This should clarify the main point or insight the visualization provides (e.g., "This line chart shows the total number of signups per month over the last year.", "This bar chart compares the average order value for different product categories.").
6.  **Respond ONLY with JSON:** Your entire output **MUST** be a single, valid JSON object containing only the keys "sql", "chartType", "title", and "description". Do **NOT** include any introductory phrases, explanations, apologies, or concluding remarks outside of the JSON object structure itself.

Example JSON Response Format (using 'line'):
{
  "sql": "SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS user_count FROM users WHERE created_at >= NOW() - INTERVAL '1 year' GROUP BY month ORDER BY month LIMIT 100;",
  "chartType": "line",
  "title": "Monthly User Signups (Last Year)",
  "description": "This line chart displays the trend of new user signups per month over the past 12 months."
}
`,
    };

    const userMessage: PromptMessage = { role: "user", content: query };
    return [systemPrompt, userMessage];
  } catch (error) {
    logger.error('Error building AI prompt:', error);
    // Re-throw to be caught by the main handler, ensuring consistent error response
    throw new QueryError("Failed to prepare AI request due to schema issues.", 500);
  }
}

// --- API Route Handler ---

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Use NextResponse for standard responses
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestBody;
  try {
      requestBody = await req.json();
  } catch (error) {
      logger.error("Failed to parse request body:", error);
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, connectionId, chatId } = requestBody;

  // --- Basic Input Validation ---
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'messages' array." }, { status: 400 });
  }
  if (!connectionId) {
    return NextResponse.json({ error: "Database connection ID ('connectionId') is required." }, { status: 400 });
  }
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || typeof lastMessage.content !== 'string' || lastMessage.content.trim() === '') {
      return NextResponse.json({ error: "Invalid or empty user query in the last message." }, { status: 400 });
  }
  const query = lastMessage.content.trim();

  // --- Optional: Save user message ---
  if (chatId) {
    try {
      await supabaseService.addMessage({
        chat_id: chatId,
        content: query,
        sender: 'user',
        // Ensure timestamp is consistent, e.g., ISO string
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Error saving user message for chatId ${chatId}:`, error);
      // Non-critical, proceed with AI query
    }
  }
  // --- End Optional ---

  let aiResponseJson: AiResponseJson | null = null;
  let generatedSql: string = '';
  let errorResult: QueryResult | null = null; // To structure error responses consistently

  try {
    // 1. Build Prompt and Get Structured Response from AI
    const promptMessages = await buildAiPrompt(query, connectionId);

    // Use a NON-streaming completion call, requesting JSON format
    // Adjust model and options as needed
    const aiJsonResponseString = await getCompletion(promptMessages, {
        // model: "gpt-4-turbo-preview", // Or your preferred model capable of JSON mode
        response_format: { type: "json_object" },
        temperature: 0.1, // Lower temperature for more deterministic JSON/SQL
    });

    aiResponseJson = safelyParseJson<AiResponseJson>(aiJsonResponseString);

    if (!aiResponseJson?.sql || !aiResponseJson?.chartType || !aiResponseJson?.title || typeof aiResponseJson?.description !== 'string') { // Check description exists
      logger.error("AI response missing required fields or invalid JSON.", { response: aiJsonResponseString });
      throw new QueryError("AI response was incomplete or incorrectly formatted. Please try rephrasing.", 502); // Bad Gateway from AI
    }

    generatedSql = aiResponseJson.sql.trim();

    // **CRITICAL VALIDATION:** Ensure it's a SELECT statement (case-insensitive check, ignoring leading comments/whitespace)
    const upperSql = generatedSql.toUpperCase();
    if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('/*') && !upperSql.startsWith('--')) {
         // Basic check allowing leading comments. More robust parsing could be used if needed.
         let checkSql = generatedSql;
         if(checkSql.startsWith('/*')) {
            const commentEndIndex = checkSql.indexOf('*/');
            if (commentEndIndex !== -1) {
                checkSql = checkSql.substring(commentEndIndex + 2).trim();
            }
         } else if (checkSql.startsWith('--')) {
             const newlineIndex = checkSql.indexOf('\n');
             if (newlineIndex !== -1) {
                 checkSql = checkSql.substring(newlineIndex + 1).trim();
             }
         }
         if(!checkSql.toUpperCase().startsWith('SELECT')) {
            logger.warn(`AI generated non-SELECT statement prevented: ${generatedSql}`);
            throw new QueryError("Sorry, I can only generate read-only SELECT statements.", 400); // Bad Request (invalid operation)
         }
    } else if (!upperSql.startsWith('SELECT')) {
         // Handle cases where it starts with comments but isn't caught above or simple SELECT check fails
          logger.warn(`AI generated non-SELECT statement prevented: ${generatedSql}`);
          throw new QueryError("Sorry, I can only generate read-only SELECT statements.", 400);
    }

    // 2. Execute the Generated SQL
    // The executeQueryService should handle connection pooling and potential SQL errors
    const { data, columns } = await executeQueryService(connectionId, generatedSql);

    // 3. Combine and Send Successful Response
    const finalResult: QueryResult = {
      sql: generatedSql,
      chartType: aiResponseJson.chartType,
      title: aiResponseJson.title,
      description: aiResponseJson.description, // Pass the explanation through
      data: data,
      columns: columns,
    };

    // Optional: Save successful assistant message (QueryResult)
    if (chatId) {
         try {
             await supabaseService.addMessage({
  chat_id: chatId,
  content: JSON.stringify(finalResult), // Backward compatibility
  sender: 'assistant',
  message_type: 'query_result',
  results: finalResult, // Store the structured result for robust parsing
  timestamp: new Date().toISOString(),
});
         } catch (error) {
             logger.error(`Error saving assistant message for chatId ${chatId}:`, error);
         }
    }

    return NextResponse.json(finalResult);

  } catch (error: any) {
    logger.error("Error during AI query or DB execution:", { query, connectionId, chatId, error: error.message, stack: error.stack });

    let statusCode = 500;
    let errorMessage = "An unexpected error occurred. Please try again later.";

    if (error instanceof QueryError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
    } else if (error.message?.includes('database') || error.message?.includes('connection') || error.message?.includes('query')) {
        // Catch specific DB-related errors if not QueryError
        errorMessage = `Database error: ${error.message}`; // Provide more specific DB error if possible
        statusCode = 503; // Service Unavailable (DB)
    } else if (error.message?.includes('AI') || error.message?.includes('OpenAI') || error.message?.includes('completion')) {
        // Catch generic AI errors if not QueryError
        errorMessage = "There was a problem communicating with the AI service.";
        statusCode = 502; // Bad Gateway (AI)
    }

    // Construct consistent error response for the frontend
    errorResult = {
        error: errorMessage,
        sql: generatedSql || "Failed before SQL generation", // Include SQL if it was generated
        title: aiResponseJson?.title || "Error Occurred",
        description: aiResponseJson?.description, // Include description if available
        chartType: aiResponseJson?.chartType || "table", // Default chart type on error
        data: [],
        columns: [],
    };

    return NextResponse.json(errorResult, { status: statusCode });
  }
}