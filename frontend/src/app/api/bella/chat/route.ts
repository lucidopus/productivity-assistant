import { NextRequest, NextResponse } from 'next/server';
import { getChatsCollection } from '@/lib/mongodb';
import { ChatMessage } from '@/types/bella';
import { HARDCODED_USER_ID } from '@/lib/constants';

// GET: Fetch chat messages for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const chatsCollection = await getChatsCollection();
    const session = await chatsCollection.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        messages: session.messages,
        status: session.status,
        continuationFlag: session.continuationFlag
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Send a user message and trigger chat handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    // Add user message to the session
    const chatsCollection = await getChatsCollection();
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      role: 'user',
      content: message
    };

    await chatsCollection.updateOne(
      { sessionId },
      {
        $push: { messages: userMessage as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
        $set: { status: 'active' }
      }
    );

    // Get the base URL dynamically from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Trigger the chat handler task
    const response = await fetch(`${baseUrl}/api/trigger/chat-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userMessage: message,
        userId: HARDCODED_USER_ID
      })
    });

    if (!response.ok) {
      throw new Error('Failed to trigger chat handler');
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Chat POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}