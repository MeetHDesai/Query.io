/**
 * Server-side authentication utilities for getServerSideProps
 * 
 * This module provides helper functions to verify Firebase authentication
 * in getServerSideProps functions and protect server-rendered pages.
 */

import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { admin } from "./auth";
import { logger } from "./logger";

const FIREBASE_TOKEN_COOKIE = "firebaseToken";

interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

/**
 * Verifies the Firebase ID token stored in cookies.
 * 
 * @param context - GetServerSidePropsContext from Next.js
 * @returns The decoded token if valid, null if no token or invalid
 */
export async function verifyAuthToken(
  context: GetServerSidePropsContext
): Promise<DecodedToken | null> {
  try {
    // Parse cookies from the request
    const cookies = parseCookies(context);
    const token = cookies[FIREBASE_TOKEN_COOKIE];

    // No token found
    if (!token) {
      return null;
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error("Server-side auth error: %O", error);
    return null;
  }
}

/**
 * Higher-order function for protected pages using getServerSideProps.
 * 
 * @param handler - The original getServerSideProps function
 * @param redirectUrl - URL to redirect unauthenticated users to
 * @returns Enhanced getServerSideProps function with auth check
 * 
 * @example
 * export const getServerSideProps = withServerAuth(
 *   async (context, token) => {
 *     // Your original getServerSideProps logic
 *     return { props: { uid: token.uid } }
 *   },
 *   "/login" // Redirect URL for unauthenticated users
 * );
 */
export function withServerAuth(
  handler: (
    context: GetServerSidePropsContext,
    token: DecodedToken
  ) => Promise<any>,
  redirectUrl: string = "/login"
) {
  return async (context: GetServerSidePropsContext) => {
    const token = await verifyAuthToken(context);

    // If no valid token, redirect to login
    if (!token) {
      return {
        redirect: {
          destination: redirectUrl,
          permanent: false,
        },
      };
    }

    // Call the original handler with the token
    return handler(context, token);
  };
}

/**
 * Function to set Firebase token cookie
 * 
 * Use this client-side after getting a token from Firebase auth
 * import { setCookie } from "nookies";
 * 
 * @example
 * const idToken = await auth.currentUser.getIdToken();
 * setCookie(null, "firebaseToken", idToken, {
 *   maxAge: 30 * 24 * 60 * 60, // 30 days
 *   path: "/",
 *   secure: process.env.NODE_ENV === "production",
 *   httpOnly: true,
 *   sameSite: "lax"
 * });
 */ 