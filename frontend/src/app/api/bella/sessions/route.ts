import { NextRequest, NextResponse } from 'next/server';
import { getChatsCollection } from '@/lib/mongodb';

const HARDCODED_USER_ID = "68cca41fb015304ecc79c64a";

// GET: Fetch current active session for the user
export async function GET() {
  try {
    const chatsCollection = await getChatsCollection();

    // Find the most recent active session
    const session = await chatsCollection.findOne(
      {
        userId: HARDCODED_USER_ID,
        status: { $in: ['active', 'awaiting_user', 'planning'] }
      },
      { sort: { createdAt: -1 } }
    );

    if (!session) {
      return NextResponse.json({
        success: true,
        session: null,
        hasActiveSession: false
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        messages: session.messages,
        status: session.status,
        continuationFlag: session.continuationFlag,
        createdAt: session.createdAt
      },
      hasActiveSession: true
    });

  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new session (for testing purposes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const chatsCollection = await getChatsCollection();

    const newSession = {
      sessionId,
      userId: HARDCODED_USER_ID,
      messages: [],
      continuationFlag: true,
      iteration: 0,
      extractedTargets: [],
      status: 'active',
      createdAt: new Date()
    };

    await chatsCollection.insertOne(newSession);

    return NextResponse.json({
      success: true,
      session: newSession
    });

  } catch (error) {
    console.error('Create session API error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}