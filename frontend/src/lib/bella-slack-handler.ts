// Slack-specific Bella message handler
// Processes user messages through existing Bella logic for Slack integration

import { ChatMessage } from '@/types/bella';
import { generateBellaResponse, formatChatHistory, BellaResponse } from './groq-client';
import { formatUserProfile } from './profile-formatter';
import { getChatsCollection, getWeeklyPlansCollection } from './mongodb';

// Slack message type
interface SlackMessage {
  text: string;
  channel: string;
  user: string;
  ts: string;
  thread_ts?: string;
}

// Slack context type
interface SlackContext {
  channelId: string;
  userId: string;
  teamId?: string;
}

// Function call type
interface FunctionCall {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Process user message through existing Bella logic adapted for Slack
 */
export async function processUserMessage(
  message: SlackMessage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _context: SlackContext
): Promise<BellaResponse> {
  try {
    // Get session from database (following repository pattern)
    const chatsCollection = await getChatsCollection();

    // First try to find active session
    let session = await chatsCollection.findOne({
      slackChannelId: message.channel,
      status: { $in: ['active', 'awaiting_user', 'planning'] }
    });

    // If no active session, find the most recent session and reactivate it
    if (!session) {
      session = await chatsCollection.findOne(
        { slackChannelId: message.channel },
        { sort: { createdAt: -1 } }
      );

      if (session) {
        // Reactivate the session
        await chatsCollection.updateOne(
          { sessionId: session.sessionId },
          { $set: { status: 'active' } }
        );
        console.log('Reactivated session:', session.sessionId);
      }
    }

    if (!session) {
      throw new Error('No session found for this channel');
    }

    // Add user message to session (following repository pattern)
    const userChatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      role: 'user',
      content: message.text
    };

    await chatsCollection.updateOne(
      { sessionId: session.sessionId },
      {
        $push: { messages: userChatMessage as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
        $set: { status: 'active' }
      }
    );

    // Get fresh session data after saving user message to get full chat history
    const updatedSession = await chatsCollection.findOne({
      sessionId: session.sessionId
    });

    if (!updatedSession) {
      throw new Error('Updated session not found');
    }

    // Process with existing Bella logic using fresh session data
    const recentMessages = updatedSession.messages.slice(-10);
    const chatHistory = formatChatHistory(recentMessages);
    const userProfile = await formatUserProfile(session.userId);

    const response = await generateBellaResponse(chatHistory, userProfile);

    if (response.error) {
      throw new Error(`Groq error: ${response.error}`);
    }

    // Add Bella's response to session
    const bellaMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      role: 'assistant',
      content: response.message
    };

    await chatsCollection.updateOne(
      { sessionId: session.sessionId },
      {
        $push: { messages: bellaMessage as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
        $inc: { iteration: 1 }
      }
    );

    return response;

  } catch (error) {
    console.error('Message processing error:', error);
    throw error;
  }
}

/**
 * Handle function calls from Bella (continuation flag and save weekly plan)
 */
export async function handleFunctionCall(functionCall: FunctionCall, context: SlackContext): Promise<void> {
  try {
    const chatsCollection = await getChatsCollection();

    if (functionCall.name === 'set_continuation_flag') {
      // Update continuation flag in session
      await chatsCollection.updateOne(
        { slackChannelId: context.channelId },
        {
          $set: {
            continuationFlag: functionCall.arguments.continueConversation as boolean,
            status: (functionCall.arguments.continueConversation as boolean) ? 'awaiting_user' : 'planning'
          }
        }
      );

      console.log('Continuation flag updated:', {
        channelId: context.channelId,
        continueConversation: functionCall.arguments.continueConversation as boolean,
        reason: functionCall.arguments.reason as string
      });

    } else if (functionCall.name === 'save_weekly_plan') {
      // Save the weekly plan to database
      const session = await chatsCollection.findOne({
        slackChannelId: context.channelId
      });

      if (!session) {
        throw new Error('Session not found for saving weekly plan');
      }

      const weeklyPlansCollection = await getWeeklyPlansCollection();

      // Create weekly plan following existing structure
      const now = new Date();
      const mondayDate = getMonday(now);
      const fridayDate = new Date(mondayDate);
      fridayDate.setDate(fridayDate.getDate() + 4);

      const weeklyPlan = {
        userId: session.userId,
        weekStart: mondayDate,
        weekEnd: fridayDate,
        sessionId: session.sessionId,
        weeklyTargets: functionCall.arguments.weeklyTargets as string[],
        days: functionCall.arguments.days as Record<string, unknown>,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      };

      const result = await weeklyPlansCollection.insertOne(weeklyPlan);

      // Update session status and link to weekly plan
      await chatsCollection.updateOne(
        { sessionId: session.sessionId },
        {
          $set: {
            status: 'completed',
            completedAt: now,
            weeklyPlanId: result.insertedId.toString()
          }
        }
      );

      console.log('Weekly plan saved:', {
        planId: result.insertedId.toString(),
        sessionId: session.sessionId,
        targetsCount: (functionCall.arguments.weeklyTargets as string[])?.length || 0
      });
    }

  } catch (error) {
    console.error('Function call handling error:', error);
    throw error;
  }
}

/**
 * Get Monday of current week
 */
function getMonday(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(date.setDate(diff));
}

/**
 * Handle Slack-specific errors with user-friendly messages
 */
export async function handleSlackError(
  error: Error,
  say: (options: { blocks: unknown[] }) => Promise<void>,
  context: SlackContext
): Promise<void> {
  try {
    // Log error following repository pattern
    console.error('Slack integration error:', {
      error: error.message,
      stack: error.stack,
      context: {
        channelId: context.channelId,
        userId: context.userId,
        timestamp: new Date()
      }
    });

    // Send user-friendly Slack message using our formatter
    const { formatErrorMessage } = await import('./slack-formatter');

    await say({
      blocks: formatErrorMessage(error.message)
    });

    // Retry logic following repository pattern
    setTimeout(async () => {
      try {
        // Retry the operation if possible
        await retryLastOperation(context);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }, 5000);

  } catch (handlerError) {
    console.error('Error handler failed:', handlerError);
  }
}

/**
 * Retry last operation (placeholder for implementation)
 */
async function retryLastOperation(context: SlackContext): Promise<void> {
  // Implementation would depend on tracking last operation
  // For now, just log that retry was attempted
  console.log('Retry operation attempted for context:', context);
}