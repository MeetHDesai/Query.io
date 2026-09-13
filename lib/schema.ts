/**
 * PostgreSQL Schema Introspection Utility
 * 
 * This module provides functionality to safely introspect the schema of a PostgreSQL database,
 * including tables and their columns. Results are cached to improve performance.
 * 
 * IMPORTANT: When using this utility:
 * - The connectionUrl must be pre-decrypted before passing to introspect()
 * - Schemas are cached for 1 hour to reduce database load
 * - Each introspection creates a new PrismaClient instance that is properly disconnected after use
 */

import { PrismaClient } from "@prisma/client";

/**
 * Information about a database column
 */
export interface ColumnInfo {
  name: string;
  dataType: string;
  isNullable: boolean;
}

/**
 * Information about a database table and its columns
 */
export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

/**
 * Complete database schema representation
 */
export type DbSchema = TableInfo[];

/**
 * Cache entry for database schemas
 */
interface CachedSchema {
  schema: DbSchema;
  expires: number;
}

// In-memory cache for database schemas
const cache = new Map<string, CachedSchema>();
const TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL

/**
 * Introspects a PostgreSQL database schema
 * 
 * @param connectionUrl - The PostgreSQL connection URL (must be decrypted)
 * @param connectionId - Unique identifier for this connection (used as cache key)
 * @returns A promise resolving to the database schema (tables and columns)
 * @throws If the connection fails or permissions are insufficient
 */
export async function introspect(connectionUrl: string, connectionId: string): Promise<DbSchema> {
  // Check cache first
  const cached = cache.get(connectionId);
  if (cached && cached.expires > Date.now()) {
    return cached.schema;
  }

  // Create a new Prisma client for this specific database
  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    }
  });

  try {
    // Query the database information schema
    const rows = await client.$queryRaw<
      Array<{ table_name: string; column_name: string; data_type: string; is_nullable: string }>
    >`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, 
        ordinal_position;
    `;

    // Transform the raw rows into our schema structure
    const schema: DbSchema = [];
    let currentTable: TableInfo | null = null;

    for (const row of rows) {
      // If we've moved to a new table
      if (!currentTable || currentTable.name !== row.table_name) {
        // Save the previous table if it exists
        if (currentTable) {
          schema.push(currentTable);
        }

        // Start a new table
        currentTable = {
          name: row.table_name,
          columns: []
        };
      }

      // Add the column to the current table
      currentTable.columns.push({
        name: row.column_name,
        dataType: row.data_type,
        isNullable: row.is_nullable === 'YES'
      });
    }

    // Add the last table if it exists
    if (currentTable) {
      schema.push(currentTable);
    }

    // Store in cache
    cache.set(connectionId, {
      schema,
      expires: Date.now() + TTL_MS
    });

    return schema;
  } catch (error) {
    // Add context to the error
    const contextError = new Error(`Schema introspection failed for connectionId ${connectionId}: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      contextError.stack = error.stack;
    }
    throw contextError;
  } finally {
    // Always disconnect to avoid dangling connections
    await client.$disconnect();
  }
}

/**
 * Clears the schema cache for a specific connection or all connections
 * 
 * @param connectionId - Optional connection ID to clear, if not provided all cache entries are cleared
 */
export function clearSchemaCache(connectionId?: string): void {
  if (connectionId) {
    cache.delete(connectionId);
  } else {
    cache.clear();
  }
}

/**
 * Gets the number of cached schemas
 * 
 * @returns The number of schemas currently cached
 */
export function getCacheSize(): number {
  return cache.size;
}

/**
 * Generates a formatted schema prompt for AI models
 * 
 * @param schema - The database schema
 * @returns A string representation of the schema suitable for AI prompts
 */
export function generateSchemaPrompt(schema: DbSchema): string {
  const tableDescriptions = schema.map(table => {
    const columnDefinitions = table.columns.map(
      col => `    - ${col.name} (${col.dataType}${col.isNullable ? ', nullable' : ''})`
    ).join('\n');
    
    return `Table: ${table.name}\nColumns:\n${columnDefinitions}`;
  }).join('\n\n');
  
  return tableDescriptions;
} 