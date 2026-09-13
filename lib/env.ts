/**
 * Environment variables with validation
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'AES_ENCRYPTION_KEY',
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate in server contexts, but not during build/bundling
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnv();
}

export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
  AES_ENCRYPTION_KEY: process.env.AES_ENCRYPTION_KEY as string,
  NODE_ENV: process.env.NODE_ENV as string,
}; 