import { task, schedules, logger, wait } from "@trigger.dev/sdk";
import { getChatsCollection, getWeeklyPlansCollection } from "../frontend/src/lib/mongodb";
import { generateBellaResponse, formatChatHistory, getWeekDates } from "../frontend/src/lib/groq-client";
import { ChatSession, ChatMessage, WeeklyPlan, TaskItem, DayPlan, SetContinuationFlagCall, SaveWeeklyPlanCall } from "../frontend/src/types/bella";
import { ObjectId } from "mongodb";
import {
  BellaPrompts,
  fillPromptTemplate,
  getHardcodedProfile
} from "../frontend/src/lib/prompts";
import { HARDCODED_USER_ID } from "../frontend/src/lib/constants";

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Helper function to generate message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Helper function to format user profile for context
async function formatUserProfile(): Promise<string> {
  const { formatProfileFromMongoDB } = await import("../frontend/src/lib/prompts");
  return await formatProfileFromMongoDB(HARDCODED_USER_ID);
}


// Helper function to save weekly plan to database
async function saveWeeklyPlan(
  userId: string,
  sessionId: string,
  planData: SaveWeeklyPlanCall
): Promise<WeeklyPlan> {
  try {
    const weeklyPlansCollection = await getWeeklyPlansCollection();
    const { weekStart, weekEnd } = getWeekDates();

    // Archive existing active plans
    await weeklyPlansCollection.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'archived', updatedAt: new Date() } }
    );

    const weeklyPlan: WeeklyPlan = {
      userId,
      weekStart,
      weekEnd,
      sessionId,
      weeklyTargets: planData.weeklyTargets,
      days: planData.days,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    const result = await weeklyPlansCollection.insertOne(weeklyPlan);
    logger.info("Weekly plan saved successfully", {
      planId: result.insertedId,
      userId,
      sessionId,
      targetsCount: planData.weeklyTargets.length
    });

    return { ...weeklyPlan, _id: result.insertedId.toString() };
  } catch (error) {
    logger.error("Failed to save weekly plan", {
      error: (error as Error).message,
      userId,
      sessionId
    });
    throw error;
  }
}

// Helper function to initialize conversation with hardcoded message
async function initializeConversation(sessionId: string, userId: string): Promise<void> {
  try {
    const chatsCollection = await getChatsCollection();

    const initialMessage: ChatMessage = {
      id: generateMessageId(),
      timestamp: new Date(),
      role: 'assistant',
      content: BellaPrompts.initialMessage.template
    };

    const chatSession: ChatSession = {
      sessionId,
      userId,
      messages: [initialMessage],
      continuationFlag: true,
      iteration: 0,
      extractedTargets: [],
      status: 'active',
      createdAt: new Date()
    };

    await chatsCollection.insertOne(chatSession);
    logger.info("Conversation initialized", { sessionId, userId });
  } catch (error) {
    logger.error("Failed to initialize conversation", {
      error: (error as Error).message,
      sessionId,
      userId
    });
    throw error;
  }
}

// Helper function to process conversation iteration
async function processConversationIteration(sessionId: string, iteration: number): Promise<void> {
  try {
    // Safety check: max 20 iterations
    if (iteration > 20) {
      logger.warn("Max iterations reached, forcing completion", { sessionId, iteration });
      await forceCompleteSession(sessionId);
      return;
    }

    const chatsCollection = await getChatsCollection();
    const session = await chatsCollection.findOne({ sessionId });

    if (!session) {
      logger.error("Session not found", { sessionId });
      return;
    }

    // Get last 10 messages for context
    const recentMessages = session.messages.slice(-10);
    const chatHistory = formatChatHistory(recentMessages);
    const userProfile = await formatUserProfile();

    logger.info("Processing conversation iteration", {
      sessionId,
      iteration,
      messageCount: recentMessages.length
    });

    // Generate Bella's response
    const response = await generateBellaResponse(chatHistory, userProfile);

    if (response.error) {
      logger.error("Error generating Bella response", {
        sessionId,
        error: response.error
      });
      return;
    }

    // Add Bella's message to the conversation
    const bellaMessage: ChatMessage = {
      id: generateMessageId(),
      timestamp: new Date(),
      role: 'assistant',
      content: response.message
    };

    // Process function calls if any
    if (response.functionCall) {
      logger.info("Processing function call", {
        sessionId,
        functionName: response.functionCall.name
      });

      if (response.functionCall.name === "set_continuation_flag") {
        const flagCall = response.functionCall.arguments as SetContinuationFlagCall;

        // Update session with continuation flag
        await chatsCollection.updateOne(
          { sessionId },
          {
            $push: { messages: bellaMessage as any },
            $set: {
              continuationFlag: flagCall.continueConversation,
              iteration: iteration,
              status: flagCall.continueConversation ? 'awaiting_user' : 'planning'
            }
          }
        );

        if (!flagCall.continueConversation) {
          logger.info("Planning phase initiated", { sessionId, reason: flagCall.reason });
          // Wait a bit for any final processing, then generate plan
          await wait.for({ seconds: 2 });
          await generateFinalPlan(sessionId);
        } else {
          logger.info("Continuing conversation", {
            sessionId,
            reason: flagCall.reason,
            missingInfo: flagCall.missingInfo
          });
          // Wait for real user input - conversation will continue when user responds
        }
      } else if (response.functionCall.name === "save_weekly_plan") {
        const planCall = response.functionCall.arguments as SaveWeeklyPlanCall;

        // Save the weekly plan
        const savedPlan = await saveWeeklyPlan(session.userId, sessionId, planCall);

        // Update session as completed
        await chatsCollection.updateOne(
          { sessionId },
          {
            $push: { messages: bellaMessage as any },
            $set: {
              status: 'completed',
              completedAt: new Date(),
              weeklyPlanId: savedPlan._id,
              extractedTargets: planCall.weeklyTargets
            }
          }
        );

        logger.info("Weekly plan generation completed", {
          sessionId,
          planId: savedPlan._id,
          targetsCount: planCall.weeklyTargets.length
        });
      }
    } else {
      // Just add the message and continue
      await chatsCollection.updateOne(
        { sessionId },
        {
          $push: { messages: bellaMessage as any },
          $set: { iteration: iteration }
        }
      );

      // Wait for user input - no automatic continuation
      logger.info("Waiting for user response", { sessionId, iteration });
    }

  } catch (error) {
    logger.error("Error processing conversation iteration", {
      sessionId,
      iteration,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
}

// Removed simulateUserResponse - using real user input only

// Helper function to force complete session
async function forceCompleteSession(sessionId: string): Promise<void> {
  try {
    const chatsCollection = await getChatsCollection();

    await chatsCollection.updateOne(
      { sessionId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          continuationFlag: false
        }
      }
    );

    logger.warn("Session force completed due to max iterations", { sessionId });
  } catch (error) {
    logger.error("Error force completing session", {
      sessionId,
      error: (error as Error).message
    });
  }
}

// Helper function to generate final plan when ready
async function generateFinalPlan(sessionId: string): Promise<void> {
  try {
    const chatsCollection = await getChatsCollection();
    const session = await chatsCollection.findOne({ sessionId });

    if (!session) {
      logger.error("Session not found for final plan generation", { sessionId });
      return;
    }

    // Format all messages for final planning
    const fullChatHistory = formatChatHistory(session.messages);
    const userProfile = await formatUserProfile();

    // Create a planning-focused prompt
    const planningPrompt = fillPromptTemplate(BellaPrompts.finalPlanningPrompt.template, {
      chatHistory: fullChatHistory
    });

    const response = await generateBellaResponse(planningPrompt, userProfile);

    if (response.functionCall?.name === "save_weekly_plan") {
      const planCall = response.functionCall.arguments as SaveWeeklyPlanCall;

      // Save the weekly plan
      const savedPlan = await saveWeeklyPlan(session.userId, sessionId, planCall);

      // Add final message and complete session
      const planSummary = "Your schedule includes your key commitments and focused work sessions.";
      const finalMessage: ChatMessage = {
        id: generateMessageId(),
        timestamp: new Date(),
        role: 'assistant',
        content: fillPromptTemplate(BellaPrompts.planCompletionMessage.template, {
          planSummary
        })
      };

      await chatsCollection.updateOne(
        { sessionId },
        {
          $push: { messages: finalMessage as any },
          $set: {
            status: 'completed',
            completedAt: new Date(),
            weeklyPlanId: savedPlan._id,
            extractedTargets: planCall.weeklyTargets
          }
        }
      );

      logger.info("Final plan generated and saved", {
        sessionId,
        planId: savedPlan._id
      });
    } else {
      logger.error("Failed to generate final plan - no save function call", { sessionId });
    }

  } catch (error) {
    logger.error("Error generating final plan", {
      sessionId,
      error: (error as Error).message
    });
  }
}

// Main scheduled task - runs every Sunday at 9 PM
export const weeklyPlanner = schedules.task({
  id: "weekly-planner",
  // cron: "0 21 * * 0", // Every Sunday at 9 PM (21:00) - Configured on dashboard
  maxDuration: 900, // 15 minutes
  run: async () => {
    logger.info("Weekly planner task started", { timestamp: new Date() });

    try {
      // Generate unique session ID
      const sessionId = generateSessionId();
      const userId = HARDCODED_USER_ID;

      logger.info("Starting weekly planning session", { sessionId, userId });

      // Initialize conversation with hardcoded message
      await initializeConversation(sessionId, userId);

      // Wait a moment for initialization
      await wait.for({ seconds: 1 });

      // The conversation is now initialized and ready for user input
      // No need to start automatic processing - wait for real user messages

      logger.info("Weekly planner task completed successfully", { sessionId });

      return {
        success: true,
        sessionId,
        userId,
        startedAt: new Date()
      };

    } catch (error) {
      logger.error("Weekly planner task failed", {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
});

// Chat handler task for processing user responses (can be triggered manually for testing)
export const chatHandler = task({
  id: "bella-chat-handler",
  maxDuration: 300, // 5 minutes
  run: async (payload: { sessionId: string; userMessage: string; iteration?: number }) => {
    logger.info("Chat handler task started", {
      sessionId: payload.sessionId,
      iteration: payload.iteration || 0
    });

    try {
      const chatsCollection = await getChatsCollection();

      // Add user message to the conversation
      const userChatMessage: ChatMessage = {
        id: generateMessageId(),
        timestamp: new Date(),
        role: 'user',
        content: payload.userMessage
      };

      await chatsCollection.updateOne(
        { sessionId: payload.sessionId },
        {
          $push: { messages: userChatMessage as any },
          $set: { status: 'active' }
        }
      );

      logger.info("User message added to conversation", {
        sessionId: payload.sessionId,
        messageLength: payload.userMessage.length
      });

      // Get current iteration from database
      const currentSession = await chatsCollection.findOne({ sessionId: payload.sessionId });
      const currentIteration = currentSession?.iteration || 0;

      // Process the actual user message with Bella's response
      await processConversationIteration(payload.sessionId, currentIteration);

      return {
        success: true,
        sessionId: payload.sessionId,
        processedAt: new Date()
      };

    } catch (error) {
      logger.error("Chat handler task failed", {
        sessionId: payload.sessionId,
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      return {
        success: false,
        error: (error as Error).message
      };
    }
  },
});