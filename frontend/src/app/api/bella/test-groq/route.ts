import { NextResponse } from 'next/server';
import { generateBellaResponse, formatChatHistory } from '@/lib/groq-client';
import { formatUserProfile } from '@/lib/profile-formatter';
import { HARDCODED_USER_ID } from '@/lib/constants';

// POST: Test Groq integration
export async function POST() {
  try {
    const testChatHistory = formatChatHistory([
      {
        role: 'assistant',
        content: "Hey! It's Sunday evening - time for our weekly planning session!",
        timestamp: new Date()
      },
      {
        role: 'user',
        content: "Yes, I'm ready to plan my week",
        timestamp: new Date()
      }
    ]);

    const userProfile = await formatUserProfile(HARDCODED_USER_ID);

    const response = await generateBellaResponse(testChatHistory, userProfile);

    return NextResponse.json({
      success: true,
      response,
      testData: {
        chatHistory: testChatHistory,
        userProfile: userProfile.substring(0, 200) + "..."
      }
    });

  } catch (error) {
    console.error('Groq test error:', error);
    return NextResponse.json(
      {
        error: 'Groq test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}