import { NextResponse } from 'next/server';
import { getChatsCollection } from '@/lib/mongodb';
import { HARDCODED_USER_ID } from '@/lib/constants';

// POST: Create a test session with initial Bella message
export async function POST() {
  try {
    const sessionId = `test_session_${Date.now()}`;
    const chatsCollection = await getChatsCollection();

    const initialMessage = {
      id: `msg_${Date.now()}_init`,
      timestamp: new Date(),
      role: 'assistant' as const,
      content: "Hey! It's Sunday evening - time for our weekly planning session! 😊 I'm here to help you organize your upcoming week. Are you ready to plan together?"
    };

    const newSession = {
      sessionId,
      userId: HARDCODED_USER_ID,
      messages: [initialMessage],
      continuationFlag: true,
      iteration: 0,
      extractedTargets: [],
      status: 'active',
      createdAt: new Date()
    };

    await chatsCollection.insertOne(newSession);

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Test session created successfully'
    });

  } catch (error) {
    console.error('Create test session error:', error);
    return NextResponse.json(
      { error: 'Failed to create test session' },
      { status: 500 }
    );
  }
}