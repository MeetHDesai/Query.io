import { NextResponse } from 'next/server';
import { admin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  // Extract authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.error('Missing or invalid authorization header');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    logger.info(`Authenticated with Firebase UID: ${firebaseUid}`);

    try {
      // Find the user in our database
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
      });

      if (!user) {
        logger.error(`No user found with Firebase UID: ${firebaseUid}`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      logger.info(`Found user in database with ID: ${user.id}`);

      // Get connections for this user
      const connections = await prisma.connection.findMany({
        where: { user_id: user.id },
      });

      logger.info(`Found ${connections.length} connections for user ${user.id}`);
      return NextResponse.json(connections);
    } catch (error: any) {
      logger.error('Error fetching connections:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch connections',
          details: error.message || String(error),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error('Invalid Firebase token:', error);
    return NextResponse.json(
      {
        error: 'Unauthorized',
        details: error.message || String(error),
      },
      { status: 401 }
    );
  }
}
