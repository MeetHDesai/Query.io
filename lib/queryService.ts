import { supabase, supabaseService } from '@/lib/supabase';
import { validateSQL, extractSQL } from '@/lib/sqlValidator';
import { logger } from '@/lib/logger';
import { QueryError } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { introspect, generateSchemaPrompt } from '@/lib/schema';
import { Pool } from 'pg';
import { decrypt } from '@/lib/encryption';

/**
 * Interface for query results with rows and columns
 */
export interface QueryResult {
  rows: any[];
  columns: string[];
  executedSql: string;
  vizType?: 'table' | 'line' | 'bar';
  title?: string;
  description?: string;
}

/**
 * Interface for simplified query results used by the chat API
 */
export interface SimpleQueryResult {
  data: any[];
  columns: string[];
}

/**
 * Run a query against a database connection
 * 
 * @param connectionId The ID of the connection to query
 * @param sqlQuery The SQL query to execute (must be validated first)
 * @returns The query results
 */
export async function executeQuery(connectionId: string, sqlQuery: string): Promise<QueryResult> {
  try {
    // Get connection details using Prisma
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });
    
    if (!connection) {
      throw new QueryError('Database connection not found', 404);
    }
    
    // Validate the SQL to prevent injection attacks
    const validationResult = validateSQL(sqlQuery);
    
    if (!validationResult.valid) {
      throw new QueryError(`Invalid SQL query: ${validationResult.reason}`, 400);
    }
    
    // Decrypt connection credentials
    const connectionString = connection.encrypted_url 
      ? decrypt(connection.encrypted_url)
      : buildConnectionString(connection);
    
    // Create a connection pool
    const pool = new Pool({ connectionString });
    
    try {
      // Execute the query
      const result = await pool.query(sqlQuery);
      
      // Extract column names
      const columns = result.fields.map(field => field.name);
      
      // Format results
      return {
        rows: result.rows,
        columns,
        executedSql: sqlQuery,
        vizType: determineVisualizationType(result.rows, columns),
        title: generateTitle(sqlQuery),
      };
    } finally {
      // Always close the pool
      await pool.end();
    }
  } catch (error) {
    if (error instanceof QueryError) {
      throw error;
    }
    
    logger.error('Error executing query:', error);
    throw new QueryError(`Failed to execute query: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

/**
 * Get database schema for a connection
 */
export async function getDatabaseSchema(connectionId: string): Promise<string> {
  try {
    // Get connection details
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });
    
    if (!connection) {
      throw new QueryError('Database connection not found', 404);
    }
    
    // Decrypt connection string
    const connectionString = connection.encrypted_url 
      ? decrypt(connection.encrypted_url)
      : buildConnectionString(connection);
    
    // Introspect the database schema
    const schema = await introspect(connectionString, connectionId);
    
    // Generate the schema prompt
    return generateSchemaPrompt(schema);
  } catch (error) {
    logger.error('Error getting database schema:', error);
    throw new QueryError('Failed to get database schema', 500);
  }
}

/**
 * Helper function to build a connection string from connection details
 */
function buildConnectionString(connection: any): string {
  const { type, host, port, db_name } = connection;
  
  if (type !== 'postgresql') {
    throw new QueryError('Only PostgreSQL connections are currently supported', 400);
  }
  
  // In a real application, you would securely store and retrieve these credentials
  // This is a simplified example
  const username = process.env.DB_USERNAME || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  
  return `postgresql://${username}:${password}@${host}:${port || 5432}/${db_name}`;
}

/**
 * Determine the best visualization type based on the data
 */
function determineVisualizationType(rows: any[], columns: string[]): 'table' | 'line' | 'bar' {
  if (rows.length === 0 || columns.length === 0) {
    return 'table';
  }
  
  // Check if data might be suitable for a bar chart
  if (columns.length === 2 && rows.length <= 10) {
    return 'bar';
  }
  
  // Check if data might be suitable for a line chart (has a date/time and numeric columns)
  if (columns.includes('date') || columns.includes('year') || columns.some(c => c.includes('date') || c.includes('time'))) {
    return 'line';
  }
  
  // Default to table
  return 'table';
}

/**
 * Generate a title for the results based on the SQL query
 */
function generateTitle(sql: string): string {
  const normalizedSql = sql.toLowerCase();
  
  if (normalizedSql.includes('count') && normalizedSql.includes('group by')) {
    return 'Count by Group';
  }
  
  if (normalizedSql.includes('sum') || normalizedSql.includes('avg') || normalizedSql.includes('min') || normalizedSql.includes('max')) {
    return 'Aggregate Results';
  }
  
  const tableMatch = normalizedSql.match(/from\s+([a-zA-Z0-9_]+)/i);
  if (tableMatch && tableMatch[1]) {
    return `${tableMatch[1].charAt(0).toUpperCase() + tableMatch[1].slice(1)} Data`;
  }
  
  return 'Query Results';
}

/**
 * Simplified query execution service for the chat API
 * This function is a wrapper around executeQuery that returns a simplified result format
 * 
 * @param connectionId The ID of the database connection to query
 * @param sqlQuery The SQL query to execute
 * @returns A simplified query result with data array and column names
 */
export async function executeQueryService(connectionId: string, sqlQuery: string): Promise<SimpleQueryResult> {
  try {
    // Execute the query using the existing executeQuery function
    const result = await executeQuery(connectionId, sqlQuery);
    
    // Return a simplified format for the chat API
    return {
      data: result.rows,
      columns: result.columns
    };
  } catch (error) {
    logger.error('Error in executeQueryService:', error);
    
    // Re-throw to be caught by the route handler
    if (error instanceof QueryError) {
      throw error;
    }
    
    throw new QueryError(`Failed to execute query: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}