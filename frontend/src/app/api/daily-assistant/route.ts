import { NextRequest, NextResponse } from 'next/server';
import { getDailyConversationsCollection } from '@/lib/mongodb';
import { executeDailyAgent, formatChatHistoryForAgent, getCurrentWeekday } from '@/lib/daily-langchain-agent';
import { getActiveWeeklyPlanId } from '@/lib/daily-assistant-tools';
import { HARDCODED_USER_ID } from '@/lib/constants';
import { DailyAssistantRequest, DailyAssistantResponse, DailyConversation } from '@/types/daily';

export async function POST(request: NextRequest) {
  try {
    const body: DailyAssistantRequest = await request.json();
    const { message, userId = HARDCODED_USER_ID } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing daily assistant request:', {
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      userId
    });

    // Get recent conversation history (last 10 for context)
    const dailyConversations = await getDailyConversationsCollection();
    const recentChats = await dailyConversations
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Format chat history for Langchain agent
    const chatHistory = formatChatHistoryForAgent(recentChats.reverse() as DailyConversation[]);

    console.log('Retrieved chat history:', {
      conversationCount: recentChats.length,
      chatHistoryLength: chatHistory.length
    });

    // Execute Langchain agent
    const result = await executeDailyAgent(message, chatHistory);

    console.log('Agent execution result:', {
      outputLength: result.output.length,
      toolsUsed: result.intermediateSteps?.length || 0
    });

    // Get current context
    const currentWeekday = getCurrentWeekday();
    const weeklyPlanId = await getActiveWeeklyPlanId(userId);

    // Store conversation following shopping-platform pattern
    const conversationDoc = {
      user_id: userId,
      user_message: { type: 'user' as const, message },
      assistant_message: { type: 'assistant' as const, message: result.output },
      tool_usage: result.intermediateSteps?.map(step => ({
        tool: step.action.tool,
        toolInput: step.action.toolInput,
        log: step.action.log || `Invoking "${step.action.tool}" with ${JSON.stringify(step.action.toolInput)}`,
        output: step.observation
      })) || [],
      timestamp: new Date(),
      weekday: currentWeekday,
      weekly_plan_id: weeklyPlanId
    };

    console.log('Saving conversation:', {
      toolsUsed: conversationDoc.tool_usage.length,
      weekday: currentWeekday,
      weeklyPlanId: weeklyPlanId ? 'found' : 'not_found'
    });

    await dailyConversations.insertOne(conversationDoc);

    const response: DailyAssistantResponse = {
      success: true,
      message: result.output,
      tools_used: conversationDoc.tool_usage.map(t => t.tool)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Daily assistant API error:', error);

    const errorResponse: DailyAssistantResponse = {
      success: false,
      message: "I'm sorry, I encountered an issue processing your request. Please try again or rephrase your question.",
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET: Health check endpoint for the daily assistant
export async function GET() {
  try {
    // Simple health check - validate that we can connect to MongoDB and create agent
    const dailyConversations = await getDailyConversationsCollection();

    // Check if collection exists and is accessible
    const count = await dailyConversations.estimatedDocumentCount();

    return NextResponse.json({
      success: true,
      status: 'healthy',
      conversationCount: count,
      currentWeekday: getCurrentWeekday(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily assistant health check failed:', error);

    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}