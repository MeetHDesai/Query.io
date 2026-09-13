/**
 * Firebase Auth Middleware
 * - Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local
 * - Use verifyAuth() in API routes to protect endpoints
 * 
 * This middleware initializes Firebase Admin SDK (once) and provides a verifyAuth middleware
 * that can be used to protect API routes by validating Firebase ID tokens.
 */

import admin from "firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";
import { CONFIG } from "./config";

// Ensure Firebase Admin is initialized only once to avoid "Firebase app already exists" errors
// during hot reloading in development
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: CONFIG.firebase.projectId,
        clientEmail: CONFIG.firebase.clientEmail,
        // The private key has already been processed to replace \n with real newlines in config.ts
        privateKey: CONFIG.firebase.privateKey,
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error("Failed to initialize Firebase Admin SDK. Check your environment variables.");
  }
}

/**
 * Extended request interface with authenticated user information
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user: { 
    uid: string;
    // Add any other user properties you might need from the Firebase token
  };
}

/**
 * Middleware to verify Firebase authentication tokens
 * 
 * @param req - NextApiRequest object
 * @param res - NextApiResponse object
 * @param next - Callback function to execute if authentication succeeds
 * @returns Response or executes next() callback
 */
export async function verifyAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Check for Authorization header
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "Missing or malformed authorization header",
      details: "Authorization header must be in format: 'Bearer {token}'"
    });
  }

  // Extract the token
  const token = header.split(" ")[1];
  
  try {
    // Verify the token with Firebase
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Attach user info to the request for downstream handlers
    (req as AuthenticatedRequest).user = { uid: decoded.uid };
    
    // Continue to the protected route handler
    return next();
  } catch (err) {
    // Log the error but don't expose details to the client
    console.error("Firebase auth error:", err);
    
    // Check for specific token errors to provide better feedback
    const error = err as Error;
    if (error.message?.includes('expired')) {
      return res.status(401).json({ error: "Token expired", message: "Please obtain a new authentication token" });
    }
    
    return res.status(401).json({ 
      error: "Invalid or expired token",
      message: "Authentication failed. Please sign in again."
    });
  }
}

// Export the initialized admin instance for use in other parts of the application if needed
export { admin }; 