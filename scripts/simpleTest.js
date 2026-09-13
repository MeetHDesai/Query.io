/**
 * Simple JavaScript test for SQL validator logic
 */

// Validation result interface
// interface ValidationResult {
//   valid: boolean;
//   errors: string[];
// }

// Copy of the validateSQL function for testing
function validateSQL(sql) {
  const errors = [];
  const trimmed = sql.trim();

  // Rule 1: Must start with SELECT
  if (!/^SELECT\b/i.test(trimmed)) {
    errors.push("Only SELECT statements are allowed.");
  }

  // Rule 2: Single-statement enforcement
  if (/;/.test(trimmed.slice(0, -1))) {
    errors.push("Multiple statements are not permitted.");
  }

  // Rule 3: Forbidden keywords
  const forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE"];
  forbidden.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "i");
    if (re.test(trimmed)) {
      errors.push(`The "${kw}" operation is forbidden.`);
    }
  });

  // Rule 4: Ensure no inline comments hiding keywords
  if (/--|\/\*/.test(trimmed)) {
    errors.push("Comments are not allowed in the SQL statement.");
  }

  return { valid: errors.length === 0, errors };
}

// Test cases: [sql, expectedValid, expectedErrorContains]
const testCases = [
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

// Run tests
let passed = 0;
let failed = 0;

console.log("Running SQL validator tests:");

for (const testCase of testCases) {
  const sql = testCase[0];
  const expectedValid = testCase[1];
  const expectedError = testCase[2];
  
  const result = validateSQL(sql);
  let testPassed = result.valid === expectedValid;
  
  // If we're expecting an error, verify it contains the expected text
  if (!expectedValid && expectedError) {
    const hasMatchingError = result.errors.some(error => 
      error.includes(expectedError)
    );
    testPassed = testPassed && hasMatchingError;
  }
  
  if (testPassed) {
    passed++;
    console.log(`✅ Test passed: "${sql.slice(0, 40)}${sql.length > 40 ? '...' : ''}"`);
  } else {
    failed++;
    console.log(`❌ Test failed: "${sql.slice(0, 40)}${sql.length > 40 ? '...' : ''}"`);
    console.log(`   Expected valid: ${expectedValid}, Actual: ${result.valid}`);
    console.log(`   Errors: ${result.errors.join(', ')}`);
  }
}

console.log(`\nTest summary: ${passed} passed, ${failed} failed`);

// Special case tests for keywords in string literals
console.log("\nSpecial case tests - Keywords in string literals:");

const stringLiteralCase = "SELECT * FROM users WHERE message = 'Please DROP by the office'";
const result = validateSQL(stringLiteralCase);

console.log(`Test case: "${stringLiteralCase}"`);
console.log(`Result valid: ${result.valid}`);
console.log(`Errors: ${result.errors.join(', ')}`);
console.log("\nLimitation: The current regex-based approach cannot distinguish");
console.log("between keywords in SQL code and keywords in string literals.");
console.log("This will produce false positives when restricted keywords appear in strings.");

// Exit with status code
process.exit(failed === 0 ? 0 : 1); 