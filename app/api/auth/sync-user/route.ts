import { NextResponse } from 'next/server';
import { syncUserFromFirebase, getUserByFirebaseId } from '@/lib/userService';
import { verifyAuthToken } from '@/lib/serverAuth';
import { admin } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * API endpoint for syncing a Firebase user with our database
 * POST /api/auth/sync-user
 */
export async function POST(req: Request) {
  try {
    // Extract authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    logger.info('Processing sync-user request');
    
    try {
      // Verify Firebase token
      logger.info('Verifying Firebase token');
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
        logger.info(`Token verified for user: ${decodedToken.uid}`);
      } catch (error) {
        const tokenError = error as Error;
        logger.error(`Token verification failed: ${tokenError.message}`, tokenError);
        return NextResponse.json({ 
          error: 'Invalid token', 
          details: tokenError.message 
        }, { status: 401 });
      }
      
      // Get the user from the request body
      let firebaseUid, email, firstName, lastName;
      try {
        const body = await req.json();
        firebaseUid = body.firebaseUid;
        email = body.email;
        firstName = body.firstName;
        lastName = body.lastName;
        logger.info(`Request body parsed, firebaseUid: ${firebaseUid}`);
      } catch (error) {
        const bodyError = error as Error;
        logger.error(`Failed to parse request body: ${bodyError.message}`, bodyError);
        return NextResponse.json({ 
          error: 'Invalid request body', 
          details: bodyError.message 
        }, { status: 400 });
      }
      
      if (!firebaseUid || !email || !firstName || !lastName) {
        logger.warn('Missing required user fields in request');
        return NextResponse.json({ 
          error: 'Missing required user fields in request body' 
        }, { status: 400 });
      }
      
      // Ensure the token UID matches the requested UID for security
      if (decodedToken.uid !== firebaseUid) {
        logger.warn(`Token UID (${decodedToken.uid}) does not match requested UID (${firebaseUid})`);
        return NextResponse.json({ 
          error: 'Unauthorized: Token UID does not match requested UID' 
        }, { status: 403 });
      }
      
      // Sync the user
      logger.info(`Attempting to sync user with Firebase UID: ${firebaseUid}`);
      // If not found, try to sync from Firebase
      const user = await syncUserFromFirebase(firebaseUid, email, firstName, lastName);
      logger.info('User synced successfully');
      return NextResponse.json({ user });
    } catch (error) {
      const innerError = error as Error;
      logger.error(`Inner error in sync-user: ${innerError.message}`, innerError);
      return NextResponse.json({ 
        error: 'Error processing request', 
        details: innerError.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    const outerError = error as Error;
    logger.error(`Outer error in sync-user: ${outerError.message}`, outerError);
    return NextResponse.json({ 
      error: 'Failed to sync user', 
      details: outerError.message
    }, { status: 500 });
  }
}