/**
 * Environment configuration with runtime validation
 * 
 * This file validates that all required environment variables are present
 * before the application starts. It will throw an error on startup if any
 * required variable is missing.
 */

const requiredVars = [
  'SUPABASE_DATABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'AES_ENCRYPTION_KEY',
] as const;

// Check that all required environment variables are set
if (typeof window === 'undefined') { // Only run on server
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  });

  // Check AES key length specifically after ensuring it exists
  if (process.env.AES_ENCRYPTION_KEY && process.env.AES_ENCRYPTION_KEY.length < 16) {
    console.warn("[config] Warning: AES_ENCRYPTION_KEY is less than 16 characters. For production, use a strong, unique secret of 32 bytes (or derived to it).");
  }
}

// Ensure NEXT_PUBLIC_SUPABASE_URL exists (client-side variable)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

// Export configuration object with typed and validated environment variables
export const CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  supabaseDbUrl: process.env.SUPABASE_DATABASE_URL!,
  openAiKey: process.env.OPENAI_API_KEY!,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    // Replace escaped newlines with actual newlines for Firebase private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  },
  // AES encryption key must be 32 bytes (256 bits) encoded in base64
  // This should NEVER be committed to source control
  aesKey: process.env.AES_ENCRYPTION_KEY!,
};

/**
 * Masks a string for safe logging - shows only first and last few characters
 * @param value The string to mask
 * @param visibleChars Number of characters to show at start and end
 */
export function maskSecret(value: string, visibleChars = 2): string {
  if (!value) return '[empty]';
  if (value.length <= visibleChars * 2) return '*'.repeat(value.length);
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  return `${start}${'*'.repeat(Math.min(10, value.length - (visibleChars * 2)))}${end}`;
} 