/**
 * Vercel AI Integration Service
 * 
 * This module provides functionality to interact with OpenAI's API via Vercel AI SDK
 * for generating SQL queries based on natural language questions and database schema information.
 * 
 * IMPORTANT: When using this utility:
 * - Requires a valid OPENAI_API_KEY in environment variables
 * - Returns validated responses for SQL generation
 * - Only generates safe SELECT queries (no destructive operations)
 */

import { createClient } from "ai";
import { CONFIG } from "./config";
import { z } from "zod";

// Error types for more granular error handling
export enum AiErrorType {
  EMPTY_RESPONSE = "empty_response",
  INVALID_JSON = "invalid_json",
  SCHEMA_VALIDATION = "schema_validation",
  RATE_LIMIT = "rate_limit",
  CONTEXT_LENGTH = "context_length",
  NETWORK = "network",
  AUTH = "authentication",
  UNKNOWN = "unknown"
}

export class AiError extends Error {
  type: AiErrorType;
  
  constructor(message: string, type: AiErrorType = AiErrorType.UNKNOWN) {
    super(message);
    this.name = "AiError";
    this.type = type;
  }
}

// Initialize the Vercel AI client with API key and cache settings
export const ai = createClient({ 
  apiKey: CONFIG.openAiKey,
  cache: 'force-cache', // Enable caching by default
});

/**
 * Define the expected response schema using Zod for validation
 */
const ResponseSchema = z.object({
  intent: z.string().describe("The interpreted user intent"),
  explanation: z.string().describe("Explanation of the SQL query"),
  sql: z.string().describe("PostgreSQL SELECT query")
});

export type AiResponse = z.infer<typeof ResponseSchema>;

/**
 * Builds a prompt for AI based on the database schema and user question
 * 
 * @param schema - The database schema information
 * @param question - The user's natural language question
 * @returns An array of messages to send to AI
 */
export function buildPrompt(schema: unknown, question: string) {
  const system = {
    role: "system" as const,
    content: "You are a helpful assistant that translates user questions into safe PostgreSQL SELECT queries."
  };
  
  const user = {
    role: "user" as const,
    content: [
      "Database schema:",
      JSON.stringify(schema),
      `User question: "${question}"`,
      "Requirements:",
      "- Only output valid JSON matching { intent, explanation, sql }.",
      "- The SQL must be a single SELECT statement with no destructive operations.",
      "- No DELETE, UPDATE, INSERT, ALTER, DROP, CREATE, or any other data-modifying statements.",
      "- Return clear error messages if the query cannot be fulfilled with the schema provided."
    ].join("\n\n")
  };
  
  return [system, user];
}

/**
 * Calls the AI API with the provided messages and validates the response
 * 
 * @param messages - Array of message objects with role and content
 * @param options - Optional configuration for the AI request (caching, etc.)
 * @returns Promise resolving to a validated AiResponse
 * @throws AiError with specific error type if the API call fails or validation fails
 */
export async function callOpenAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { cache?: boolean }
): Promise<AiResponse> {
  try {
    const response = await ai.chat.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0,
      max_tokens: 1500,
      cache: options?.cache === false ? 'no-store' : 'force-cache', // Allow per-call cache control
    });
    
    const text = await response.text();
    if (!text || text.trim() === "") {
      throw new AiError("Empty response from AI", AiErrorType.EMPTY_RESPONSE);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      throw new AiError(
        `AI returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
        AiErrorType.INVALID_JSON
      );
    }
    
    try {
      // Apply strict Zod validation
      return ResponseSchema.parse(parsed);
    } catch (err) {
      // Provide detailed validation error messages
      if (err instanceof z.ZodError) {
        const details = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        throw new AiError(`Response failed schema validation: ${details}`, AiErrorType.SCHEMA_VALIDATION);
      }
      throw new AiError(
        `Response failed schema validation: ${err instanceof Error ? err.message : String(err)}`,
        AiErrorType.SCHEMA_VALIDATION
      );
    }
  } catch (err) {
    // Handle Vercel AI SDK specific errors
    if (err instanceof AiError) {
      // Pass through our custom errors
      throw err;
    }
    
    // Map SDK errors to our custom error types
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    if (errorMessage.includes("rate limit")) {
      throw new AiError(`Rate limit exceeded: ${errorMessage}`, AiErrorType.RATE_LIMIT);
    } else if (errorMessage.includes("context length")) {
      throw new AiError(`Context length exceeded: ${errorMessage}`, AiErrorType.CONTEXT_LENGTH);
    } else if (errorMessage.includes("authentication") || errorMessage.includes("API key")) {
      throw new AiError(`Authentication error: ${errorMessage}`, AiErrorType.AUTH);
    } else if (errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED")) {
      throw new AiError(`Network error: ${errorMessage}`, AiErrorType.NETWORK);
    } else {
      throw new AiError(`AI generation failed: ${errorMessage}`, AiErrorType.UNKNOWN);
    }
  }
}

/**
 * Stream-based version of callOpenAI that returns a ReadableStream of AI responses
 * Use this for real-time streaming of AI responses to the client
 * 
 * @param messages - Array of message objects with role and content
 * @returns Promise resolving to a stream of AI responses
 */
export async function streamOpenAI(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
) {
  return ai.chat.stream({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
    max_tokens: 1500,
  });
} 