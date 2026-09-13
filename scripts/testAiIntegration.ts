/**
 * AI Integration Test Script
 * 
 * This script tests the enhanced Vercel AI integration with features like:
 * - Strong type validation
 * - Error handling
 * - Caching
 * - Streaming
 * 
 * Run with: npm run ai:test
 */

import { buildPrompt, callOpenAI, streamOpenAI, AiError, AiErrorType } from '../lib/ai';
import { validateSQL } from '../lib/sqlValidator';

// Simple sample schema
const schema = { 
  tables: [
    { 
      name: "users", 
      columns: [
        { name: "id", dataType: "text", isNullable: false },
        { name: "email", dataType: "text", isNullable: false },
        { name: "created_at", dataType: "timestamp", isNullable: false },
        { name: "name", dataType: "text", isNullable: true }
      ] 
    },
    {
      name: "posts",
      columns: [
        { name: "id", dataType: "text", isNullable: false },
        { name: "title", dataType: "text", isNullable: false },
        { name: "content", dataType: "text", isNullable: false },
        { name: "user_id", dataType: "text", isNullable: false },
        { name: "created_at", dataType: "timestamp", isNullable: false }
      ]
    }
  ]
};

// Test prompts
const testQueries = [
  "How many users do we have?",
  "Show me all posts from a user with email john@example.com",
  "Count posts per user and sort by count descending",
  "What's the average number of posts per user?"
];

/**
 * Tests regular AI completion with validation
 */
async function testCompletion() {
  console.log("\n=== Testing AI Completion ===\n");
  
  try {
    // Test the first query
    const question = testQueries[0];
    console.log(`Query: "${question}"`);
    
    const messages = buildPrompt(schema, question);
    const result = await callOpenAI(messages);
    
    console.log(`✅ Response received:`);
    console.log(`Intent: ${result.intent}`);
    console.log(`Explanation: ${result.explanation.slice(0, 100)}...`);
    console.log(`SQL: ${result.sql}`);
    
    // Validate the SQL
    const validation = validateSQL(result.sql);
    if (validation.valid) {
      console.log("✅ SQL validation passed");
    } else {
      console.log("❌ SQL validation failed:");
      console.log(validation.errors);
    }
  } catch (err) {
    if (err instanceof AiError) {
      console.log(`❌ AI Error [${err.type}]: ${err.message}`);
    } else {
      console.log(`❌ Unexpected error: ${err}`);
    }
  }
}

/**
 * Tests AI completion with caching
 */
async function testCaching() {
  console.log("\n=== Testing AI Caching ===\n");
  
  try {
    // First call should not be cached
    const question = testQueries[1];
    console.log(`Query: "${question}"`);
    
    console.log("First call (cache disabled):");
    const startTime1 = Date.now();
    const messages = buildPrompt(schema, question);
    const result1 = await callOpenAI(messages, { cache: false });
    console.log(`✅ Response time: ${Date.now() - startTime1}ms`);
    
    // Second call with cache enabled should be faster
    console.log("\nSecond call (cache enabled):");
    const startTime2 = Date.now();
    const result2 = await callOpenAI(messages, { cache: true });
    console.log(`✅ Response time: ${Date.now() - startTime2}ms`);
    
    // Check if responses match
    const responseMatch = result1.sql === result2.sql;
    console.log(`✅ Responses match: ${responseMatch}`);
    
    // Third call with cache enabled should be very fast (using Vercel AI SDK cache)
    console.log("\nThird call (with cache):");
    const startTime3 = Date.now();
    const result3 = await callOpenAI(messages, { cache: true });
    console.log(`✅ Response time: ${Date.now() - startTime3}ms`);
  } catch (err) {
    if (err instanceof AiError) {
      console.log(`❌ AI Error [${err.type}]: ${err.message}`);
    } else {
      console.log(`❌ Unexpected error: ${err}`);
    }
  }
}

/**
 * Tests streaming AI responses
 */
async function testStreaming() {
  console.log("\n=== Testing AI Streaming ===\n");
  
  try {
    const question = testQueries[2];
    console.log(`Query: "${question}"`);
    
    const messages = buildPrompt(schema, question);
    const stream = await streamOpenAI(messages);
    
    let fullContent = '';
    let chunkCount = 0;
    
    console.log("Streaming chunks:");
    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        fullContent += content;
        chunkCount++;
        
        // Print a dot for each chunk to show progress
        process.stdout.write('.');
      }
    }
    
    console.log(`\n\n✅ Received ${chunkCount} chunks`);
    
    try {
      // Try to parse the full content as JSON
      const parsed = JSON.parse(fullContent);
      console.log("✅ Parsed JSON response:");
      console.log(`Intent: ${parsed.intent}`);
      console.log(`SQL: ${parsed.sql}`);
    } catch (err) {
      console.log("❌ Failed to parse response as JSON:");
      console.log(fullContent.slice(0, 200) + "...");
    }
  } catch (err) {
    if (err instanceof AiError) {
      console.log(`❌ AI Error [${err.type}]: ${err.message}`);
    } else {
      console.log(`❌ Unexpected error: ${err}`);
    }
  }
}

/**
 * Tests error handling with a malformed query
 */
async function testErrorHandling() {
  console.log("\n=== Testing Error Handling ===\n");
  
  try {
    // Test with an extremely long prompt to trigger a potential error
    const longPrompt = "x".repeat(100000);
    console.log(`Testing with very long prompt (${longPrompt.length} chars)`);
    
    const messages = buildPrompt(schema, longPrompt);
    await callOpenAI(messages);
    
    console.log("❓ Expected an error but none was thrown");
  } catch (err) {
    if (err instanceof AiError) {
      console.log(`✅ AI Error correctly caught: [${err.type}] ${err.message}`);
    } else {
      console.log(`❓ Unexpected error type: ${err}`);
    }
  }
}

// Run all tests
async function runTests() {
  console.log("=== VERCEL AI INTEGRATION TESTS ===\n");
  
  try {
    await testCompletion();
    await testCaching();
    await testStreaming();
    await testErrorHandling();
    
    console.log("\n=== All tests completed ===");
  } catch (err) {
    console.error("Test suite failed:", err);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
}); 