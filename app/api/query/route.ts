import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { executeQuery } from '@/lib/queryService';
import { validateSQL } from '@/lib/sqlValidator';
import { logger } from '@/lib/logger';
import { QueryError } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    const { query, connectionId } = await req.json();
    
    if (!connectionId) {
      return NextResponse.json({ error: "Database connection ID is required" }, { status: 400 });
    }
    
    if (!query) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 });
    }
    
    // Validate the SQL query
    const validationResult = validateSQL(query);
    
    if (!validationResult.valid) {
      return NextResponse.json({ 
        error: `Invalid SQL query: ${validationResult.reason}` 
      }, { status: 400 });
    }
    
    // Execute the query
    const results = await executeQuery(connectionId, query);
    
    // Return the results
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof QueryError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    logger.error("Error executing SQL query:", error);
    return NextResponse.json({ 
      error: "Failed to execute query. Please try again later." 
    }, { status: 500 });
  }
} 