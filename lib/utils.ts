import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { logger } from "./logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export class QueryError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'QueryError';
    // Ensure stack trace is captured (optional, depends on environment)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QueryError);
    }
  }
}

/**
 * Safely parses a JSON string and returns the parsed object or null if parsing fails
 * @param jsonString The JSON string to parse
 * @returns The parsed object or null if parsing fails
 */
export function safelyParseJson<T>(jsonString: string | null | undefined): T | null {
  if (typeof jsonString !== 'string' || !jsonString) {
    // Handle null, undefined, or non-string inputs gracefully
    if (jsonString !== null && jsonString !== undefined) {
      logger.warn('safelyParseJson received non-string input:', typeof jsonString);
    }
    return null;
  }
  try {
    // Attempt to parse the string as JSON
    const parsed = JSON.parse(jsonString);
    // Return the parsed object cast to type T
    return parsed as T;
  } catch (e: any) {
    // Log the error with the problematic string for debugging
    logger.error('Failed to parse JSON string:', { error: e.message, jsonString });
    return null; // Return null if parsing fails
  }
}
