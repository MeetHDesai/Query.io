/**
 * SQL Validator Test Script
 * 
 * This script tests the SQL validation functionality to ensure it correctly
 * identifies safe and unsafe SQL statements.
 * 
 * To run this script:
 *   npx ts-node scripts/sqlValidatorTest.ts
 */

import { validateSQL, ValidationResult } from "../lib/sqlValidator";

// Helper function to run a test case
function runTest(
  name: string, 
  sql: string, 
  expectedValid: boolean, 
  expectedErrors: string[] = []
): boolean {
  const result = validateSQL(sql);
  
  // Check overall validity
  const validityMatch = result.valid === expectedValid;
  
  // Check if all expected errors are present
  const errorsMatch = expectedErrors.every(expected => 
    result.errors.some(actual => actual.includes(expected))
  );
  
  // Check if there are no unexpected errors
  const noExtraErrors = expectedErrors.length === result.errors.length;
  
  // Overall test result
  const passed = validityMatch && errorsMatch && noExtraErrors;
  
  // Print the test result
  console.log(`Test: ${name}`);
  console.log(`  SQL: ${sql}`);
  console.log(`  Expected valid: ${expectedValid}, Got: ${result.valid}`);
  
  if (!validityMatch) {
    console.log('  ❌ Validity check failed');
  }
  
  if (!errorsMatch || !noExtraErrors) {
    console.log('  ❌ Error messages mismatch');
    console.log(`  Expected errors: ${JSON.stringify(expectedErrors)}`);
    console.log(`  Actual errors: ${JSON.stringify(result.errors)}`);
  }
  
  console.log(`  ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(''); // Add a blank line for readability
  
  return passed;
}

// Main test function
function runTests() {
  console.log('🧪 SQL Validator Tests\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Valid SELECT statements
  total++;
  if (runTest(
    'Valid SELECT', 
    'SELECT * FROM users', 
    true, 
    []
  )) passed++;
  
  // Test 2: Valid SELECT with WHERE clause
  total++;
  if (runTest(
    'Valid SELECT with WHERE', 
    'SELECT id, name FROM users WHERE active = true', 
    true, 
    []
  )) passed++;
  
  // Test 3: Valid SELECT with trailing semicolon
  total++;
  if (runTest(
    'Valid SELECT with trailing semicolon', 
    'SELECT count(*) FROM users;', 
    true, 
    []
  )) passed++;
  
  // Test 4: Invalid - Missing SELECT
  total++;
  if (runTest(
    'Missing SELECT', 
    'UPDATE users SET active = false', 
    false, 
    ['Only SELECT statements are allowed']
  )) passed++;
  
  // Test 5: Invalid - Multiple statements
  total++;
  if (runTest(
    'Multiple statements', 
    'SELECT 1; SELECT 2;', 
    false, 
    ['Multiple statements are not permitted']
  )) passed++;
  
  // Test 6: Invalid - Forbidden keyword (UPDATE)
  total++;
  if (runTest(
    'Forbidden keyword - UPDATE', 
    'SELECT * FROM UPDATE_logs', 
    false, 
    ['UPDATE']
  )) passed++;
  
  // Test 7: Invalid - Forbidden keyword (DROP)
  total++;
  if (runTest(
    'Forbidden keyword - DROP', 
    'SELECT * FROM users WHERE status = DROP', 
    false, 
    ['DROP']
  )) passed++;
  
  // Test 8: Valid - Keyword in string literal
  total++;
  if (runTest(
    'Keyword in string literal', 
    "SELECT * FROM users WHERE message = 'Please DROP by'", 
    false, 
    ['DROP']
  )) passed++;
  
  // Test 9: Invalid - Contains SQL comment
  total++;
  if (runTest(
    'Contains SQL comment', 
    'SELECT * FROM users -- Get all users', 
    false, 
    ['Comments are not allowed']
  )) passed++;
  
  // Test 10: Invalid - Contains block comment
  total++;
  if (runTest(
    'Contains block comment', 
    'SELECT * FROM users /* Get all users */', 
    false, 
    ['Comments are not allowed']
  )) passed++;
  
  // Test 11: Invalid - Attempted SQL injection
  total++;
  if (runTest(
    'Attempted SQL injection', 
    "SELECT * FROM users WHERE id = '1' OR 1=1; DROP TABLE users; --'", 
    false, 
    ['Multiple statements', 'DROP']
  )) passed++;
  
  // Test 12: Invalid - Sneaky comment to hide destructive operation
  total++;
  if (runTest(
    'Sneaky comment with hidden operation', 
    'SELECT * FROM users -- WHERE 1=1; DROP TABLE users;', 
    false, 
    ['Comments are not allowed']
  )) passed++;
  
  // Summary
  console.log(`\n📊 Test Summary: ${passed} of ${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed!');
    return false;
  }
}

// Run the tests
const success = runTests();

// Exit with appropriate code
process.exit(success ? 0 : 1); 