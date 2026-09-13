import { supabaseService } from '@/lib/supabase';
import { admin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { QueryError } from '@/lib/utils';

/**
 * Syncs a Firebase user with our database after authentication
 * This ensures we have matching records in Supabase/Prisma
 * 
 * @param firebaseUid The Firebase UID of the user
 * @returns The synced user record
 */
export async function syncUserFromFirebase(firebaseUid: string, email: string, firstName: string, lastName: string) {
  try {
    // First, check if the user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      logger.info(`User with Firebase UID ${firebaseUid} already exists in database`);
      return existingUser;
    }

    // If not, fetch user details from Firebase
    const firebaseUser = await admin.auth().getUser(firebaseUid);
    if (!firebaseUser) {
      throw new QueryError(404, `No Firebase user found with UID: ${firebaseUid}`);
    }

    // Create a new user record in our database
    const newUser = await prisma.user.create({
      data: {
        firebaseUid: firebaseUser.uid,
        email,
        firstName,
        lastName,
      },
    });

    logger.info(`Created new user in database for Firebase UID: ${firebaseUid}`);
    
    return newUser;
  } catch (error) {
    logger.error(`Error syncing user from Firebase: ${error}`);
    throw error;
  }
}

/**
 * Gets a user from our database by Firebase UID
 * If the user doesn't exist in our database but exists in Firebase, creates it
 * 
 * @param firebaseUid The Firebase UID of the user
 * @returns The user record
 */
export async function getUserByFirebaseId(firebaseUid: string, email: string, firstName: string, lastName: string) {
  try {
    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      return existingUser;
    }

    // If not found, try to sync from Firebase
    return await syncUserFromFirebase(firebaseUid, email, firstName, lastName);
  } catch (error) {
    logger.error(`Error getting user by Firebase ID: ${error}`);
    throw error;
  }
}

/**
 * Updates a user's profile information
 * 
 * @param firebaseUid The Firebase UID of the user
 * @returns The updated user record
 */
export async function updateUserProfile(firebaseUid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });
    
    logger.info(`Found user profile for Firebase UID: ${firebaseUid}`);
    return user;
  } catch (error) {
    logger.error(`Error finding user profile: ${error}`);
    throw error;
  }
} 