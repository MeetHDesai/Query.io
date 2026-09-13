/**
 * SQL Validator Basic Test
 * 
 * Simple script to run the built-in tests for the SQL validator
 */

const { runValidatorTests } = require("../lib/sqlValidator");

// Run the validator tests and process exit based on result
const passed = runValidatorTests();
process.exit(passed ? 0 : 1); 