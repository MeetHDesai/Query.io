import { NextResponse } from 'next/server';
import { admin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Define thread types for the fallback raw query
type RawThread = {
  id: string;
  connection_id: string;
  database_id: string;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  messages?: RawMessage[];
};

type RawMessage = {
  id: string;
  threadId: string;
  content: string;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
  sql?: string | null;
  message_type?: string;
  results?: any;
};

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

      // Get the user's connections
      const connections = await prisma.connection.findMany({
        where: {
          user_id: user.id,
        },
      });

      logger.info(`Found ${connections.length} connections for the user`);

      if (!connections.length) {
        logger.info('No connections found, returning empty chats array');
        return NextResponse.json([]);
      }

      // Get connection IDs
      const connectionIds = connections.map((conn) => conn.id);
      logger.info(`Connection IDs: ${connectionIds.join(', ')}`);

      try {
        // Skip this attempt as we know it won't work - but keep for possible future use
        /*
        const chatThreads = await prisma.chatThread.findMany({
          where: {
            connectionId: {
              in: connectionIds
            }
          },
          include: {
            messages: true,
            connection: true
          }
        })
        */

        // We'll go directly to the raw query that works with the actual database schema
        logger.info('Using raw queries to match database schema');

        let chatThreads: RawThread[] = [];

        // Execute separate queries for each connection ID
        for (const connId of connectionIds) {
          const threads = await prisma.$queryRaw<RawThread[]>`
            SELECT * FROM "chat_threads" 
            WHERE "connection_id" = ${connId}
          `;
          chatThreads = [...chatThreads, ...threads];
        }

        logger.info(`Found ${chatThreads.length} chat threads`);

        // Get messages for each thread - using the correct threadId column name
        for (const thread of chatThreads) {
          const messages = await prisma.$queryRaw<RawMessage[]>`
            SELECT id, "threadId", content, sender, "createdAt", "updatedAt", sql, message_type, results FROM "chat_messages" 
            WHERE "threadId" = ${thread.id}
            ORDER BY "createdAt" ASC
          `;
          thread.messages = messages || [];
        }

        logger.info(`Added messages to ${chatThreads.length} chat threads`);
        logger.info('API returning chatThreads payload:', JSON.stringify(chatThreads, null, 2));
        return NextResponse.json(chatThreads);
      } catch (error: any) {
        logger.error('Error executing raw queries:', error);
        return NextResponse.json(
          {
            error: 'Failed to fetch chats',
            details: error.message || String(error),
          },
          { status: 500 }
        );
      }
    } catch (error: any) {
      logger.error('Error fetching chats:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch chats',
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
