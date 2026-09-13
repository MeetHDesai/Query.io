// Validated for Next.js API route correctness.
import { NextResponse } from "next/server"
import { admin } from "@/lib/auth"
import { supabaseAdminService, supabaseAdmin } from "@/lib/supabase-admin"
import { encrypt } from "@/lib/encryption"
import { Client } from 'pg'; // Added import

// Log the first few characters of the service role key to confirm it's loaded and distinct from the anon key
console.log('[API Connections] Using service role key:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 5));

export async function GET(req: Request) { // Confirmed correct export for Next.js API route
  try {
    // Extract Firebase token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid
    
    // Get user from database by Firebase UID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebaseUid', userId)
      .single()
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const connections = await supabaseAdminService.getConnectionsByUserId(user.id)
    
    return NextResponse.json(connections)
  } catch (error) {
    console.error('Error in GET /api/connections:', error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}

export async function POST(req: Request) { // Confirmed correct export for Next.js API route
  try {
    // Extract Firebase token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid
    
    // LOGGING: Log the decoded Firebase UID
    console.log('[API Connections POST] Decoded Firebase UID:', userId);
    
    // Get user from database by Firebase UID
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, firebaseUid')
      .eq('firebaseUid', userId)
      .single()
    
    // LOGGING: Log the user query result
    console.log('[API Connections POST] User query result:', user, userError);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const data = await req.json()
    console.log('Connection data received:', {
      ...data,
      password: data.password ? '******' : undefined // Mask password in logs
    })
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Connection name is required" }, { status: 400 })
    }
    
    if (!data.host) {
      return NextResponse.json({ error: "Host or connection string is required" }, { status: 400 })
    }
    
    // Format PostgreSQL connection string if individual fields are provided
    let connectionString = data.host;
    
    // If host doesn't look like a connection string, build one from individual fields
    if (!connectionString.startsWith('postgresql://')) {
      // Build connection string from individual fields if provided
      const host = data.host;
      const port = data.port || '5432';
      const user = data.username;
      const password = data.password;
      const database = data.database;
      
      if (user && database) {
        const auth = password ? `${user}:${password}` : user;
        connectionString = `postgresql://${auth}@${host}:${port}/${database}`;
      } else {
        return NextResponse.json({ 
          error: "Missing required connection details. Either provide a full connection string or complete individual fields."
        }, { status: 400 })
      }
    }
    
    // --- Connection Test --- START
    const testClient = new Client({ connectionString });
    try {
      await testClient.connect(); // Attempt connection
      await testClient.end(); // Close the connection if successful
      console.log("[API Connections POST] Connection test successful.");
    } catch (error: any) {
      console.error("[API Connections POST] Connection test failed:", error);
      await testClient.end(); // Ensure client is closed on error too

      let errorMessage = "Failed to connect to the database.";
      // Map common errors
      if (error.code === '28P01') { // Invalid password / authentication failure
        errorMessage = "Authentication failed. Please check username and password.";
      } else if (error.code === '3D000') { // Database does not exist
        errorMessage = `Database '${data.database}' not found.`;
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
        errorMessage = `Could not connect to host '${data.host}:${data.port}'. Please check host and port, and ensure the database server is accessible.`;
      }

      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 400 }
      );
    }
    // --- Connection Test --- END

    // Encrypt the connection string only AFTER successful test
    let encryptedUrl: string;
    try {
      encryptedUrl = encrypt(connectionString);
    } catch (encError: any) {
      console.error("[API Connections POST] Encryption failed:", encError);
      return NextResponse.json(
        { error: "Failed to secure connection details.", details: encError.message },
        { status: 500 }
      );
    }

    // Save the connection to the database
    const payload = {
      user_id: user.id,
      name: data.name,
      type: (data.type || 'POSTGRESQL').toUpperCase(),
      encrypted_url: encryptedUrl,
      host: data.host,
      port: data.port ? parseInt(data.port, 10) : 5432,
      db_name: data.database,
    };
    console.log('Inserting connections payload:', payload);
    let newConnection;
    try {
      newConnection = await supabaseAdminService.createConnection(payload);
      console.log('Insert result:', newConnection);
    } catch (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }
    return NextResponse.json(newConnection)
  } catch (error) {
    console.error("Error creating connection:", error)
    
    // Return a more helpful error message
    let errorMessage = "Failed to create connection";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific database errors
      if (error.message.includes('schema cache')) {
        errorMessage = "Database schema error. Please check that the connections table has the correct structure.";
      } else if (error.message.includes('duplicate key')) {
        errorMessage = "A connection with this name already exists.";
        statusCode = 409;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}