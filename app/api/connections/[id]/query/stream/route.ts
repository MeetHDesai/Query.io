import { admin } from '@/lib/auth';
import { executeQuery, getDatabaseSchema, QueryResult } from '@/lib/queryService';
import { logger } from '@/lib/logger';
import { QueryError } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import openai from '@/lib/openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Streaming API endpoint for database queries
 * POST /api/connections/[id]/query/stream
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Extract authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error("Missing or invalid authorization header");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
      // Get the connection ID from params
      const resolvedParams = await params;
      const connectionId = resolvedParams.id;
      
      // Parse the request body
      const body = await req.json();
      const { messages, chatId } = body;
      
      if (!connectionId) {
        return Response.json({ error: "Database connection ID is required" }, { status: 400 });
      }
      
      // Find the user in our database
      const user = await prisma.user.findUnique({
        where: { firebaseUid }
      });
      
      if (!user) {
        logger.error(`No user found with Firebase UID: ${firebaseUid}`);
        return Response.json({ error: "User not found" }, { status: 404 });
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
        return Response.json({ error: "Database connection not found" }, { status: 404 });
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
      
      // 4. Call the LLM with streaming
      logger.info(`Generating streaming response for query: "${naturalLanguageQuery}"`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [systemMessage, ...formattedMessages],
        temperature: 0.3,
        response_format: { type: "json_object" },
        stream: true,
      });
      
      // Create a readable stream
      const stream = new ReadableStream({
        async start(controller) {
          // Function to handle each chunk from OpenAI
          const onPart = async (part: any) => {
            if (part.choices?.[0]?.delta?.content) {
              const text = part.choices[0].delta.content;
              controller.enqueue(new TextEncoder().encode(text));
            }
          };
          
          // Process the stream
          for await (const part of response) {
            await onPart(part);
          }
          
          controller.close();
        },
      });
      
      // Save the assistant message to chat history after the full response is generated
      // This would typically be done in a separate function or webhook
      // since we can't await the full stream before returning
      if (chatId) {
        // In a production system, we'd handle this differently
        // Perhaps via a separate API call from the frontend after stream completion
        // or using a WebSocket or Server-Sent Event for real-time updates
      }
      
      // Note: For streaming, we're directly sending the LLM response
      // The frontend is responsible for parsing the JSON and building the charts
      // Unlike the non-streaming endpoint, we don't modify the response object
      // Make sure the frontend properly handles chartData and chartConfig
      
      // Return the stream with appropriate headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      });
      
    } catch (error: any) {
      logger.error('Error during query processing:', error);
      
      const errorMessage = error instanceof QueryError 
        ? `Error executing SQL: ${error.message}`
        : error.message || 'An unexpected error occurred';
      
      return Response.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return Response.json({ error: "Authentication failed" }, { status: 401 });
  }
} 