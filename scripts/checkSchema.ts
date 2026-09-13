/**
 * Schema Introspection Test Script
 * 
 * This script verifies the functionality of the schema introspection utility.
 * It connects to the database specified by SUPABASE_DATABASE_URL environment variable
 * and displays the discovered schema.
 * 
 * To run:
 *   ts-node scripts/checkSchema.ts
 */

import { introspect, getCacheSize, clearSchemaCache } from "../lib/schema";

// Main function to test schema introspection
async function checkSchema() {
  console.log("🔍 Schema Introspection Test\n");
  
  // Ensure required environment variable is available
  const testUrl = process.env.SUPABASE_DATABASE_URL;
  if (!testUrl) {
    console.error("❌ Error: SUPABASE_DATABASE_URL environment variable is not set");
    console.error("   Please set this variable in .env.local or as an environment variable");
    process.exit(1);
  }
  
  try {
    console.log("⏳ Introspecting database schema...");
    const startTime = Date.now();
    
    // First introspection - should query the database
    const schema = await introspect(testUrl, "test-connection");
    const firstDuration = Date.now() - startTime;
    
    console.log(`✅ Schema discovered in ${firstDuration}ms`);
    console.log(`📊 Found ${schema.length} tables`);
    
    // Display some basic stats
    if (schema.length > 0) {
      console.log("\n📋 Tables Summary:");
      for (const table of schema) {
        console.log(`   - ${table.name} (${table.columns.length} columns)`);
      }
    }
    
    // Test cache
    console.log("\n🧪 Testing cache functionality...");
    const cacheStartTime = Date.now();
    const cachedSchema = await introspect(testUrl, "test-connection");
    const cacheDuration = Date.now() - cacheStartTime;
    
    console.log(`✅ Cached retrieval: ${cacheDuration}ms (vs. ${firstDuration}ms for first query)`);
    console.log(`📦 Cache size: ${getCacheSize()} entries`);
    
    // Show full schema details if requested
    if (process.argv.includes("--details")) {
      console.log("\n📝 Full Schema Details:");
      console.log(JSON.stringify(schema, null, 2));
    } else {
      console.log("\nTip: Run with --details flag to see full schema JSON");
    }
    
    // Clear cache
    console.log("\n🧹 Clearing cache...");
    clearSchemaCache();
    console.log(`✅ Cache cleared. New size: ${getCacheSize()} entries`);
    
  } catch (error) {
    console.error("❌ Schema check failed:", error);
    process.exit(1);
  }
}

// Run the check function
checkSchema().catch(err => {
  console.error("❌ Unhandled error:", err);
  process.exit(1);
}); 