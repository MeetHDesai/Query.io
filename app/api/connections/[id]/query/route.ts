import { NextResponse } from 'next/server';
import { admin } from '@/lib/auth';
import { executeQuery, getDatabaseSchema, QueryResult } from '@/lib/queryService';
import { logger } from '@/lib/logger';
import { QueryError } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import openai from '@/lib/openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { extractSQL } from '@/lib/sqlValidator';

/**
 * API endpoint for database queries
 * POST /api/connections/[id]/query
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Extract authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error("Missing or invalid authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // 1. Receive & Authenticate
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    logger.info(`Authenticated with Firebase UID: ${firebaseUid}`);
    
    try {
      // Get the connection ID from params - params must be awaited in Next.js App Router
      const resolvedParams = await params;
      const connectionId = resolvedParams.id;
      
      // Parse the request body
      const body = await req.json();
      const { messages, chatId } = body;
      
      if (!connectionId) {
        return NextResponse.json({ error: "Database connection ID is required" }, { status: 400 });
      }
      
      // Find the user in our database
      const user = await prisma.user.findUnique({
        where: { firebaseUid }
      });
      
      if (!user) {
        logger.error(`No user found with Firebase UID: ${firebaseUid}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      // Verify the connection belongs to this user
      const connection = await prisma.connection.findFirst({
        where: {
          id: connectionId,
          user_id: user.id
        }
      });
      
      if (!connection) {
        logger.error(`Connection ${connectionId} not found for user ${user.id}`);
        return NextResponse.json({ error: "Database connection not found" }, { status: 404 });
      }
      
      // Get the last user message
      const lastUserMessage = messages[messages.length - 1];
      
      // Process the user query
      const naturalLanguageQuery = lastUserMessage.content;
      
      // Save user message immediately to chat history
      if (chatId) {
        try {
          await prisma.chatMessage.create({
            data: {
              threadId: chatId,
              content: naturalLanguageQuery,
              sender: 'USER',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        } catch (error) {
          logger.error('Error saving user message:', error);
          // Log but continue
        }
      }
      
      // 2. Ensure Schema Is Cached
      // getDatabaseSchema already handles caching via the introspect function
      logger.info(`Fetching schema for connection: ${connectionId}`);
      const schema = await getDatabaseSchema(connectionId);
      logger.info(`Schema fetched successfully for connection: ${connectionId}`);
      
      // 3. Build LLM Prompt with history and schema
      // Format the chat history messages for AI
      const CHAT_HISTORY_LENGTH = 5; // Get last 5 exchanges
      const formattedMessages: ChatCompletionMessageParam[] = messages
        .slice(-CHAT_HISTORY_LENGTH * 2) // Get recent messages
        .filter((msg: any) => msg && msg.role && msg.content) // Filter out any invalid messages
        .map((msg: { role: string; content: string }) => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content || '' // Ensure content is never null
        }));
      
      // System message with instructions and schema
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `You are **QueryIO's SQL & Chart Assistant**, a secure, reliable large‑language model whose sole output is a strict JSON envelope. You translate natural‑language requests into valid SQL, execute it, and return structured results, including tables or chart data ready for Shadcn's Chart component. Follow these rules exactly:

1. **Top‑Level JSON Envelope**  
   Always return **only** valid JSON with these fields:
   - \`"outputType"\`: one of \`"text"\`, \`"table"\`, or \`"chart"\`.
   - \`"sql"\`: the exact \`SELECT\` query you will run (string), or \`null\` if none.
   - \`"data"\`: if \`"outputType"\` is \`"table"\`, an object:
     \`\`\`json
     {
       "columns": ["col1", "col2", …],
       "rows":    [[val1, val2, …], …]
     }
     \`\`\`
     Otherwise \`null\`.
   - \`"chartData"\`: if \`"outputType"\` is \`"chart"\`, an array of objects, each row object's keys match the column names, e.g.
     \`\`\`json
     [
       { "month": "March", "revenue": 12345 },
       { "month": "April", "revenue": 16000 }
     ]
     \`\`\`
     Otherwise \`null\`.
   - \`"chartConfig"\`: if \`"outputType"\` is \`"chart"\`, a Shadcn ChartConfig object mapping each metric key to \`{ label: string, color: string }\`, for example:
     \`\`\`json
     {
       "revenue": {
         "label": "Revenue",
         "color": "hsl(var(--chart-1))"
       }
     }
     \`\`\`
     Otherwise \`null\`.
   - \`"explanation"\`: a single human‑readable sentence summarizing the result or guidance.

2. **Determining \`outputType\`**  
   - **Text**: questions that don't map to SQL (e.g. "How does this work?"). Set \`sql\`, \`data\`, \`chartData\`, \`chartConfig\` to \`null\`, and put your answer in \`explanation\`.  
   - **Table**: pure data requests (e.g. "Show me top 5 users"). Produce \`sql\` + \`data\` + a brief \`explanation\`.  
   - **Chart**: analytical or comparative requests (e.g. "Compare revenue in March vs. April"). Produce \`sql\`, \`data\`, **and** both \`chartData\` plus \`chartConfig\`.

3. **SQL Rules**  
   - Only generate a single \`SELECT\` statement—no DDL or DML.  
   - Alias aggregates in **snake_case** (e.g. \`COUNT(*) AS user_count\`).  
   - Never include comments or natural‑language in the SQL.  
   - Let the backend apply \`LIMIT\` and timeouts.  

4. **Data Integrity**  
   - Do not "hallucinate" values. Your \`data\` and \`chartData\` must come from executing \`sql\`.  
   - Types and formatting (dates, numbers) are passed through as‑is; downstream code handles display formatting.

5. **Shadcn Chart Compatibility**  
   - **chartData** must be an array of flat objects. Keys must match the column names exactly.  
   - **chartConfig** must satisfy Shadcn's \`ChartConfig\` type: for every metric key you include in \`chartData\`, map it to an object with \`label\` and \`color\`. Use CSS variables (\`var(--chart-N)\`) or hex/HSL.

6. **Error & Fallback**  
   - If you can't map the request to SQL, respond with:
     \`\`\`json
     {
       "outputType":"text",
       "sql":null,
       "data":null,
       "chartData":null,
       "chartConfig":null,
       "explanation":"I'm sorry, I don't see how to turn that into a database query. Could you rephrase?"
     }
     \`\`\`

7. **Strict Formatting**  
   - Return only the JSON—no markdown fences, no extra fields, no commentary.  
   - Ensure valid JSON syntax with no trailing commas.

Database schema:
${schema}`
      };
      
      // 4. Call the LLM
      logger.info(`Generating response for query: "${naturalLanguageQuery}"`);
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o', // Use capable model for query understanding
        messages: [systemMessage, ...formattedMessages],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const responseContent = aiResponse.choices[0].message.content?.trim() || '';
      
      let responseJson;
      try {
        responseJson = JSON.parse(responseContent);
      } catch (error) {
        logger.error('Error parsing AI response as JSON:', error);
        return NextResponse.json({ 
          error: "Failed to parse AI response" 
        }, { status: 500 });
      }
      
      // 5. Parse the response and determine next steps
      const {
        sql,
        outputType,
        chartSpec,
        data,
        chartData,
        chartConfig,
        answer,
        explanation
      } = responseJson;
      
      let queryResults: QueryResult | null = null;
      
      // 6, 7, 8. Validate & Execute SQL if needed
      if (sql && outputType !== 'text') {
        try {
          logger.info(`Executing SQL: ${sql}`);
          queryResults = await executeQuery(connectionId, sql);
          logger.info(`SQL executed successfully. Rows fetched: ${queryResults.rows.length}`);
          
          // Add visualization metadata if chart requested
          if (outputType === 'chart' && chartSpec) {
            queryResults.vizType = chartSpec.type === 'bar' ? 'bar' : 'line';
            queryResults.title = chartSpec.title || 'Query Results';
          }
        } catch (error) {
          logger.error('Error executing SQL query:', error);
          return NextResponse.json({ 
            error: `Failed to execute query: ${error instanceof Error ? error.message : String(error)}` 
          }, { status: 500 });
        }
      }
      
      // 9. Save assistant message with results
      if (chatId) {
        try {
          await prisma.chatMessage.create({
            data: {
              threadId: chatId,
              content: answer || explanation || 'Query executed successfully.',
              sender: 'ASSISTANT',
              createdAt: new Date(),
              updatedAt: new Date(),
              sql: sql || null
            }
          });
        } catch (error) {
          logger.error('Error saving assistant message:', error);
          // Log but continue, don't fail the request
        }
      }
      
      // 10. Return response to client
      if (outputType === 'text') {
        // Text response format
        return NextResponse.json({
          outputType: "text",
          sql: null,
          data: null,
          chartData: null,
          chartConfig: null,
          explanation: explanation || answer || 'Query executed successfully'
        });
      } else if (outputType === 'table' && queryResults) {
        // Table response format
        return NextResponse.json({
          outputType: "table",
          sql: sql || '',
          data: {
            columns: queryResults.columns,
            rows: queryResults.rows
          },
          chartData: null,
          chartConfig: null,
          explanation: explanation || 'Query executed successfully'
        });
      } else if (outputType === 'chart' && queryResults) {
        // Chart response format
        // Pass through any chartConfig/chartData unmodified
        // If the LLM didn't include them, ensure they're null
        return NextResponse.json({
          outputType: "chart",
          sql: sql || '',
          data: {
            columns: queryResults.columns,
            rows: queryResults.rows
          },
          chartData: chartData || null,
          chartConfig: chartConfig || null,
          chartSpec: chartSpec || null,
          explanation: explanation || 'Query executed successfully'
        });
      } else {
        // Fallback format if no results or invalid output type
        return NextResponse.json({
          outputType: "text",
          sql: null,
          data: null,
          chartData: null,
          chartConfig: null,
          explanation: explanation || answer || 'No results were found for your query.'
        });
      }
      
    } catch (error: any) {
      logger.error('Error during query processing:', error);
      
      const errorMessage = error instanceof QueryError 
        ? `Error executing SQL: ${error.message}`
        : error.message || 'An unexpected error occurred';
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
} 