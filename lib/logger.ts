/**
 * Isomorphic Logger Implementation
 * 
 * This module provides a logging solution that works seamlessly in both:
 * 1. Client-side environments (browser)
 * 2. Server-side environments (Node.js)
 * 3. Server Components and Client Components in Next.js
 * 
 * - Does NOT use winston or any other Node.js-specific logging libraries
 * - Safe to import anywhere in your application
 * - Provides consistent logging interface across environments
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

// Type definitions for our logger interface
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

interface LoggerInterface {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  verbose: (...args: any[]) => void;
  silly: (...args: any[]) => void;
  [key: string]: any;
}

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Create a simple formatter for log messages
 * @param level The log level
 * @param args The arguments to format
 */
const formatLogMessage = (level: string, args: any[]): any[] => {
  // Simple timestamp
  const timestamp = new Date().toISOString();
  
  // If first arg is a string, prepend timestamp and level
  if (typeof args[0] === 'string') {
    return [`[${timestamp}] [${level.toUpperCase()}] ${args[0]}`, ...args.slice(1)];
  }
  
  // Otherwise just add timestamp and level as separate args
  return [`[${timestamp}] [${level.toUpperCase()}]`, ...args];
};

// Create our isomorphic logger
export const logger: LoggerInterface = {
  error: (...args: any[]) => console.error(...formatLogMessage('error', args)),
  warn: (...args: any[]) => console.warn(...formatLogMessage('warn', args)),
  info: (...args: any[]) => console.info(...formatLogMessage('info', args)),
  debug: (...args: any[]) => console.debug(...formatLogMessage('debug', args)),
  verbose: (...args: any[]) => console.log(...formatLogMessage('verbose', args)),
  silly: (...args: any[]) => console.log(...formatLogMessage('silly', args))
};

// Add environment information
logger.isBrowser = isBrowser;
logger.isServer = !isBrowser;

/**
 * Wraps a Next.js API handler to catch unhandled errors,
 * log them, and return a generic 500 response.
 * 
 * @param handler - The Next.js API handler to wrap
 * @returns A wrapped handler with error handling
 */
export function withErrorHandler(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      logger.error("Unhandled error in %s %s: %O", req.method, req.url, err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}

/**
 * Helper function to mask sensitive data in logs
 * 
 * @param value - The string to mask
 * @param visibleChars - Number of characters to show at start and end
 * @returns Masked string (e.g., "ab***yz")
 */
export function maskSensitive(value: string, visibleChars = 2): string {
  if (!value) return '[empty]';
  if (value.length <= visibleChars * 2) return '*'.repeat(value.length);
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  return `${start}${'*'.repeat(Math.min(10, value.length - (visibleChars * 2)))}${end}`;
} 