import { validateSQL, extractSQL } from '../lib/sqlValidator';

describe('validateSQL', () => {
  describe('valid SELECT queries', () => {
    test('accepts a simple SELECT *', () => {
      expect(validateSQL('SELECT * FROM users')).toEqual({ valid: true });
    });

    test('accepts a SELECT with a JOIN', () => {
      const sql =
        'SELECT orders.id, users.name FROM orders JOIN users ON orders.user_id = users.id';
      expect(validateSQL(sql)).toEqual({ valid: true });
    });

    test('accepts a SELECT with WHERE, ORDER BY, and LIMIT', () => {
      const sql =
        "SELECT id, name FROM users WHERE active = true ORDER BY name ASC LIMIT 10";
      expect(validateSQL(sql)).toEqual({ valid: true });
    });
  });

  describe('rejects statements that do not start with SELECT', () => {
    test.each([
      ['INSERT', "INSERT INTO users (name) VALUES ('mallory')"],
      ['UPDATE', "UPDATE users SET active = false WHERE id = 1"],
      ['DELETE', "DELETE FROM users WHERE id = 1"],
      ['DROP', "DROP TABLE users"],
      ['ALTER', "ALTER TABLE users ADD COLUMN hacked BOOLEAN"],
      ['CREATE', "CREATE TABLE evil (id INT)"],
      ['TRUNCATE', "TRUNCATE TABLE users"],
    ])('rejects a query starting with %s', (_label, sql) => {
      const result = validateSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Only SELECT queries are allowed for security reasons');
    });
  });

  describe('multi-statement injection', () => {
    test('rejects a stacked query with a semicolon in the middle', () => {
      const sql = 'SELECT * FROM users; DROP TABLE users;';
      const result = validateSQL(sql);
      expect(result).toEqual({
        valid: false,
        reason: 'Multiple SQL statements are not allowed',
      });
    });

    test('rejects a stacked query with no trailing semicolon', () => {
      const sql = 'SELECT * FROM users WHERE id = 1; SELECT * FROM accounts';
      const result = validateSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Multiple SQL statements are not allowed');
    });

    // Regression test for the fixed stacked-query bypass: a multi-statement
    // query whose final statement ends with a semicolon (and which contains
    // no dangerous keywords) must still be rejected, not silently pass.
    test('FIXED: a trailing-semicolon stacked query is now correctly rejected', () => {
      const sql = 'SELECT 1; SELECT 2;';
      const result = validateSQL(sql);
      expect(result).toEqual({
        valid: false,
        reason: 'Multiple SQL statements are not allowed',
      });
    });

    test('accepts a single SELECT with exactly one trailing semicolon', () => {
      expect(validateSQL('SELECT * FROM users;')).toEqual({ valid: true });
    });

    test('rejects a query with a double trailing semicolon', () => {
      const result = validateSQL('SELECT * FROM users;;');
      expect(result).toEqual({
        valid: false,
        reason: 'Multiple SQL statements are not allowed',
      });
    });
  });

  describe('each dangerous keyword is individually rejected', () => {
    test.each([
      ['insert', "SELECT * FROM logs WHERE action = 'insert record'"],
      ['update', "SELECT * FROM logs WHERE action = 'update record'"],
      ['delete', "SELECT * FROM logs WHERE action = 'delete record'"],
      ['drop', "SELECT * FROM logs WHERE note = 'drop shipment'"],
      ['alter', "SELECT * FROM logs WHERE note = 'alter schedule'"],
      ['create', "SELECT * FROM logs WHERE note = 'create event'"],
      ['truncate', "SELECT * FROM logs WHERE note = 'truncate text'"],
      ['exec', "SELECT * FROM logs WHERE note = 'exec summary'"],
      ['execute', "SELECT * FROM logs WHERE note = 'execute plan'"],
      ['xp_', "SELECT * FROM logs WHERE note = 'xp_cmdshell test'"],
      ['sp_', "SELECT * FROM logs WHERE note = 'sp_helptext test'"],
      ['sysobjects', 'SELECT * FROM sysobjects'],
      ['information_schema', 'SELECT * FROM information_schema.tables'],
      ['pg_', 'SELECT * FROM pg_catalog.pg_tables'],
      ['sys.', 'SELECT * FROM sys.tables'],
    ])('rejects queries containing "%s"', (keyword, sql) => {
      const result = validateSQL(sql);
      // NOTE: with word-boundary matching, "exec" (checked before "execute"
      // in the keywords array) no longer matches inside "execute" as a
      // substring, so a query containing "execute" now correctly reports
      // "execute" instead of "exec". This incidentally fixes the old
      // "execute reports as exec" label quirk as a side effect of the
      // substring-matching fix, rather than a separate change.
      expect(result).toEqual({
        valid: false,
        reason: `Query contains disallowed keyword: ${keyword}`,
      });
    });

    test('rejects a keyword hidden inside a subquery', () => {
      const sql =
        'SELECT * FROM (SELECT table_name FROM information_schema.tables) AS t';
      const result = validateSQL(sql);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Query contains disallowed keyword: information_schema');
    });

    // Regression tests for the fixed substring false-positive matching:
    // keyword matching now uses word-boundary regex, so a keyword that is
    // merely a substring of a longer identifier (e.g. "update" inside
    // "updated", "create" inside "created_at") no longer triggers rejection.
    test('FIXED: a value containing "update" as a substring (e.g. "updated") is no longer falsely rejected', () => {
      const sql = "SELECT * FROM orders WHERE status = 'updated'";
      expect(validateSQL(sql)).toEqual({ valid: true });
    });

    test('FIXED: a column name containing "create" as a substring (e.g. "created_at") is no longer falsely rejected', () => {
      const sql = 'SELECT created_at FROM logs';
      expect(validateSQL(sql)).toEqual({ valid: true });
    });

    test('still rejects "update" when it appears as its own token, not just a substring', () => {
      const result = validateSQL("SELECT * FROM logs WHERE note = 'update now'");
      expect(result).toEqual({
        valid: false,
        reason: 'Query contains disallowed keyword: update',
      });
    });
  });

  describe('invalid input types', () => {
    test('rejects an empty string', () => {
      expect(validateSQL('')).toEqual({ valid: false, reason: 'SQL query is required' });
    });

    test('rejects null', () => {
      // @ts-expect-error intentionally passing an invalid type
      expect(validateSQL(null)).toEqual({ valid: false, reason: 'SQL query is required' });
    });

    test('rejects undefined', () => {
      // @ts-expect-error intentionally passing an invalid type
      expect(validateSQL(undefined)).toEqual({ valid: false, reason: 'SQL query is required' });
    });

    test('rejects a non-string input (number)', () => {
      // @ts-expect-error intentionally passing an invalid type
      expect(validateSQL(12345)).toEqual({ valid: false, reason: 'SQL query is required' });
    });

    test('rejects a non-string input (object)', () => {
      // @ts-expect-error intentionally passing an invalid type
      expect(validateSQL({ sql: 'SELECT * FROM users' })).toEqual({
        valid: false,
        reason: 'SQL query is required',
      });
    });
  });

  describe('case-insensitivity', () => {
    test('accepts a SELECT with mixed-case keyword', () => {
      expect(validateSQL('SeLeCt * FROM users')).toEqual({ valid: true });
    });

    test('rejects a dangerous keyword regardless of case', () => {
      const result = validateSQL('SELECT * FROM logs WHERE note = "DROP shipment"');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Query contains disallowed keyword: drop');
    });

    test('rejects a statement not starting with SELECT regardless of case', () => {
      const result = validateSQL('DrOp TABLE users');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Only SELECT queries are allowed for security reasons');
    });
  });
});

describe('extractSQL', () => {
  test('extracts SQL from a ```sql code block', () => {
    const text = 'Here is your query:\n```sql\nSELECT * FROM users\n```\nLet me know if you need more.';
    expect(extractSQL(text)).toBe('SELECT * FROM users');
  });

  test('extracts a bare SELECT...FROM statement from surrounding prose', () => {
    const text = 'Sure, try this: SELECT id, name FROM users\n\nLet me know how it goes.';
    expect(extractSQL(text)).toBe('SELECT id, name FROM users');
  });

  // Regression test for the fixed extraction order: JSON-shaped input is now
  // parsed before the SELECT...FROM regex runs, so a JSON payload whose "sql"
  // value itself contains a readable "SELECT ... FROM ..." phrase returns
  // clean SQL instead of a malformed match with trailing JSON syntax.
  test('FIXED: extracts clean SQL from a JSON payload even when the value contains a SELECT...FROM phrase', () => {
    const text = 'Response: {"sql": "SELECT * FROM accounts"}';
    expect(extractSQL(text)).toBe('SELECT * FROM accounts');
  });

  test('extracts SQL from a JSON payload when no SELECT...FROM phrase pre-empts it', () => {
    const text = 'Response: {"sql": "select 1"}';
    expect(extractSQL(text)).toBe('select 1');
  });

  test('returns null when no SQL can be found', () => {
    expect(extractSQL('This response has no SQL in it at all.')).toBeNull();
  });

  test('returns null for empty or non-string input', () => {
    expect(extractSQL('')).toBeNull();
    // @ts-expect-error intentionally passing an invalid type
    expect(extractSQL(null)).toBeNull();
  });
});
