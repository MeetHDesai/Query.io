/**
 * Database Connectivity Test Script
 * 
 * To run this script after setting your .env.local:
 *   npx ts-node scripts/dbTest.ts
 *
 * Make sure SUPABASE_DATABASE_URL is populated before running.
 */

import prisma from "../lib/prisma";
import { CONFIG } from "../lib/config";

// Guard against missing environment variables
if (!process.env.SUPABASE_DATABASE_URL) {
  console.error("ERROR: SUPABASE_DATABASE_URL is not set. Populate .env.local before running this script.");
  process.exit(1);
}

/**
 * Main function to test database connectivity
 */
async function main() {
  try {
    // Mask the URL for logging (show only host and port, hide credentials)
    const rawUrl = CONFIG.supabaseDbUrl;
    const masked = rawUrl.replace(/(postgresql:\/\/).+(@[^:]+:\d+)/, "$1***$2");
    console.log("Using database URL:", masked);

    console.log("Attempting to connect to database...");
    
    // Test query - simplest possible query to verify connectivity
    const result = await prisma.$queryRaw`SELECT 1 AS result;`;
    console.log("DB Connection Test Result:", result);
    console.log("✅ Database connection successful!");

    // Test a query against our schema
    try {
      // This will fail if the migration hasn't been applied yet
      console.log("Checking if 'users' table exists...");
      const userCount = await prisma.user.count();
      console.log(`✅ 'users' table exists with ${userCount} records.`);
    } catch (error) {
      console.warn("⚠️ Could not query 'users' table. Has the migration been applied?");
      console.warn("Run: npx prisma migrate dev");
    }
  } finally {
    // Ensure we always disconnect, even if an error occurs
    await prisma.$disconnect();
    console.log("Disconnected cleanly from database.");
  }
}

// Execute the main function with error handling
main().catch(err => {
  console.error("❌ DB Test Failure:");
  console.error(err);
  
  // Provide helpful error messages for common issues
  if (err.message?.includes('connect ETIMEDOUT') || err.message?.includes('getaddrinfo ENOTFOUND')) {
    console.error("\nTROUBLESHOOTING:");
    console.error("- Check if the database host is correct and accessible");
    console.error("- Verify your network connection");
    console.error("- Ensure any VPN is configured correctly if needed to access the database");
  }
  
  if (err.message?.includes('password authentication failed')) {
    console.error("\nTROUBLESHOOTING:");
    console.error("- Check if username and password in SUPABASE_DATABASE_URL are correct");
  }
  
  if (err.message?.includes('database') && err.message?.includes('does not exist')) {
    console.error("\nTROUBLESHOOTING:");
    console.error("- Verify database name in SUPABASE_DATABASE_URL");
    console.error("- Check if the database has been created on the server");
  }
  
  process.exit(1);
}); 