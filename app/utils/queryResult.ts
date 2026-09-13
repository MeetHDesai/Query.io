// utils/queryResult.ts

import { QueryResult } from "../dashboard/components/QueryResult";

/**
 * Normalize a possibly partial or malformed QueryResult object into a valid QueryResult.
 * Ensures all required fields are present and optional fields are formatted.
 */
export function normalizeQueryResult(obj: any): QueryResult {
  // Ensure all required fields are present
  const normalized: QueryResult = {
    data: Array.isArray(obj.data) ? obj.data : [],
    columns: Array.isArray(obj.columns) ? obj.columns : [],
    sql: typeof obj.sql === 'string' ? obj.sql : '',
  };

  // Add optional fields if present
  if (typeof obj.chartType === 'string') {
    normalized.chartType = obj.chartType as any;
  } else {
    // Default to table if not specified
    normalized.chartType = "table";
  }

  // Normalize description
  if (typeof obj.description === 'string') {
    let description = obj.description.trim();
    if (description.length > 0) {
      // Capitalize
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }
    if (description.length > 0 && !description.endsWith('.')) {
      description += '.';
    }
    normalized.description = description;
  } else if (typeof obj.title === 'string') {
    normalized.description = obj.title;
  } else {
    normalized.description = "Query results showing the requested data.";
  }

  // Set a meaningful title if present
  if (typeof obj.title === 'string') {
    normalized.title = obj.title;
  }

  if (typeof obj.error === 'string') {
    normalized.error = obj.error;
  }

  return normalized;
}
