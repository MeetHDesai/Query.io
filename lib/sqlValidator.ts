/**
 * SQL Validation Service
 * 
 * This module provides validation logic to ensure SQL statements meet security requirements
 * before execution. It enforces rules to prevent destructive operations.
 */

/**
 * Validates SQL to ensure it's read-only and safe
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that a SQL query is read-only and does not contain unsafe operations
 */
export function validateSQL(sql: string): ValidationResult {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, reason: 'SQL query is required' };
  }
  
  // Normalize whitespace and convert to lowercase for easier validation
  const normalizedSql = sql.trim().toLowerCase();
  
  // Ensure the query starts with SELECT
  if (!normalizedSql.startsWith('select')) {
    return { 
      valid: false, 
      reason: 'Only SELECT queries are allowed for security reasons' 
    };
  }
  
  // Block multi-statements with semicolons (possible SQL injection)
  if (normalizedSql.indexOf(';') !== -1 && !normalizedSql.endsWith(';')) {
    return { 
      valid: false, 
      reason: 'Multiple SQL statements are not allowed' 
    };
  }
  
  // Block dangerous keywords that might indicate attempts to modify data or access system tables
  const dangerousKeywords = [
    'insert', 'update', 'delete', 'drop', 'alter', 'create', 
    'truncate', 'exec', 'execute', 'xp_', 'sp_', 'sysobjects',
    'information_schema', 'pg_', 'sys.'
  ];
  
  for (const keyword of dangerousKeywords) {
    if (normalizedSql.includes(keyword)) {
      return { 
        valid: false, 
        reason: `Query contains disallowed keyword: ${keyword}` 
      };
    }
  }
  
  // Pass all checks
  return { valid: true };
}

/**
 * Extracts SQL from AI-generated text
 * 
 * This function attempts to identify and extract SQL queries from AI responses
 * that may contain explanation text along with the query.
 * 
 * @param text - The text containing SQL to extract
 * @returns The extracted SQL or null if none found
 */
export function extractSQL(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  // Try to extract SQL from code blocks
  const codeBlockRegex = /```sql\s*([\s\S]*?)\s*```/i;
  const codeBlockMatch = text.match(codeBlockRegex);
  
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  
  // Try to find SQL by looking for SELECT statements
  const selectRegex = /(SELECT[\s\S]+?FROM[\s\S]+?)(?:$|;|\n\n)/i;
  const selectMatch = text.match(selectRegex);
  
  if (selectMatch && selectMatch[1]) {
    return selectMatch[1].trim();
  }
  
  // Try to extract from a JSON structure
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.sql && typeof parsed.sql === 'string') {
        return parsed.sql.trim();
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  
  return null;
}

/**
 * Run basic tests on the SQL validator
 * @returns True if all tests pass, false otherwise
 */
export function runValidatorTests(): boolean {
  // Test cases: [sql, expectedValid, expectedErrorContains]
  const testCases: [string, boolean, string?][] = [
    // Valid cases
    ["SELECT * FROM users", true],
    ["SELECT id, name FROM users WHERE active = true", true],
    ["SELECT count(*) FROM users;", true],
    
    // Invalid cases
    ["UPDATE users SET active = false", false, "Only SELECT statements are allowed"],
    ["SELECT 1; SELECT 2;", false, "Multiple statements are not permitted"],
    ["SELECT * FROM UPDATE_logs", false, "UPDATE"],
    ["SELECT * FROM users -- Get all users", false, "Comments are not allowed"],
    ["SELECT * FROM users /* Get all users */", false, "Comments are not allowed"],
    ["SELECT * FROM users WHERE id = '1' OR 1=1; DROP TABLE users; --'", false, "Multiple statements"]
  ];

  let passed = 0;
  let failed = 0;

  console.log("Running SQL validator tests:");
  
  for (const [sql, expectedValid, expectedError] of testCases) {
    const result = validateSQL(sql);
    let testPassed = result.valid === expectedValid;
    
    // If we're expecting an error, verify it contains the expected text
    if (!expectedValid && expectedError) {
      const hasMatchingError = !!(result.reason && result.reason.includes(expectedError));
      testPassed = testPassed && hasMatchingError;
    }
    
    if (testPassed) {
      passed++;
      console.log(`✅ Test passed: "${sql.slice(0, 40)}${sql.length > 40 ? '...' : ''}"`);
    } else {
      failed++;
      console.log(`❌ Test failed: "${sql.slice(0, 40)}${sql.length > 40 ? '...' : ''}"`);
      console.log(`   Expected valid: ${expectedValid}, Actual: ${result.valid}`);
      console.log(`   Reason: ${result.reason}`);
    }
  }
  
  console.log(`\nTest summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
} 