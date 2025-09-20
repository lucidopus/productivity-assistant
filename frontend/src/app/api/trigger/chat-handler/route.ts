import { NextRequest, NextResponse } from 'next/server';
import { getChatsCollection } from '@/lib/mongodb';
import { generateBellaResponse, formatChatHistory } from '@/lib/groq-client';
import { formatUserProfile } from '@/lib/profile-formatter';
import { ChatMessage } from '@/types/bella';

// POST: Process user message and generate Bella's response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userMessage, userId } = body;

    if (!sessionId || !userMessage || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Processing chat handler with:', {
      sessionId,
      userMessage,
      userId
    });

    // Get current session from database
    const chatsCollection = await getChatsCollection();
    const session = await chatsCollection.findOne({ sessionId });

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Get recent chat history (last 10 messages)
    const recentMessages = session.messages.slice(-10);
    const chatHistory = formatChatHistory(recentMessages);
    const userProfile = await formatUserProfile(userId);

    // Generate Bella's response using Groq
    const bellaResponse = await generateBellaResponse(chatHistory, userProfile);

    if (bellaResponse.error) {
      throw new Error(`Groq error: ${bellaResponse.error}`);
    }

    // Process function calls first to potentially modify the message
    let finalMessage = bellaResponse.message;

    // Process function calls if any (for future weekly plan generation)
    if (bellaResponse.functionCall) {
      console.log('Function call detected:', bellaResponse.functionCall.name);

      if (bellaResponse.functionCall.name === 'set_continuation_flag') {
        const flagCall = bellaResponse.functionCall.arguments as {
          continueConversation: boolean;
          reason?: string;
          missingInfo?: string[];
        };

        // If the LLM didn't provide message content, generate one based on the function call
        if (!finalMessage || finalMessage === "I'm processing your request...") {
          // Generate a natural response based on what info is needed
          if (flagCall.continueConversation && flagCall.missingInfo && flagCall.missingInfo.length > 0) {
            const questions = flagCall.missingInfo.map((info: string) => {
              const infoLower = info.toLowerCase();

              // Convert technical descriptions to natural questions
              if (infoLower.includes('presentation') || infoLower.includes('prep')) {
                return "How would you like to break down those 6 hours of presentation prep? For example: 2 hours for slide creation, 2 hours for content refinement, 2 hours for practice? And which specific topics will you be covering?";
              } else if (infoLower.includes('grading') || infoLower.includes('wednesday')) {
                return "How long do you typically need for your Wednesday grading session? And which assignments will you be grading?";
              } else if (infoLower.includes('gym') || infoLower.includes('workout')) {
                return "What type of workouts do you prefer? (cardio, strength training, yoga, swimming?) And when during the day works best - morning, afternoon, or evening?";
              } else if (infoLower.includes('travel') || infoLower.includes('seminar') || infoLower.includes('location')) {
                return "Is the department seminar on campus, or will you need travel time? And would you like some buffer time before the presentation to set up and calm your nerves?";
              } else if (infoLower.includes('meal') || infoLower.includes('cook')) {
                return "What types of meals are you thinking of preparing? Quick breakfasts, meal prep lunches, or hearty dinners?";
              }
              // Return a cleaned version of the original if no match
              return info;
            }).filter((q: string) => q && q.length > 0);

            finalMessage = `Great plan! I love that you're balancing your presentation prep with self-care. To create the perfect schedule for you, I need a few more details:\n\n${questions.join('\n\n')}`;
          } else {
            finalMessage = flagCall.reason || "Let me gather a bit more information to create the perfect schedule for you.";
          }
        }

        await chatsCollection.updateOne(
          { sessionId },
          {
            $set: {
              continuationFlag: flagCall.continueConversation,
              status: flagCall.continueConversation ? 'awaiting_user' : 'planning'
            }
          }
        );
        console.log('Continuation flag set:', flagCall.continueConversation);
      } else if (bellaResponse.functionCall.name === 'save_weekly_plan') {
        const planCall = bellaResponse.functionCall.arguments as { weeklyTargets?: string[]; days: Record<string, unknown> };
        console.log('Saving weekly plan to database...');

        // Import weekly plans collection
        const { getWeeklyPlansCollection } = await import('@/lib/mongodb');
        const weeklyPlansCollection = await getWeeklyPlansCollection();

        // Get week dates
        const { getWeekDates } = await import('@/lib/groq-client');
        const { weekStart, weekEnd } = getWeekDates();

        // Create weekly plan document
        const weeklyPlan = {
          userId,
          weekStart,
          weekEnd,
          sessionId,
          weeklyTargets: planCall.weeklyTargets || [],
          days: planCall.days,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        };

        // Archive any existing active plans
        await weeklyPlansCollection.updateMany(
          { userId, status: 'active' },
          { $set: { status: 'archived', updatedAt: new Date() } }
        );

        // Save new plan
        const result = await weeklyPlansCollection.insertOne(weeklyPlan);
        console.log('Weekly plan saved with ID:', result.insertedId);

        // Update session status
        await chatsCollection.updateOne(
          { sessionId },
          {
            $set: {
              status: 'completed',
              weeklyPlanId: result.insertedId
            }
          }
        );

        // Add a confirmation message from Bella
        const confirmationMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          timestamp: new Date(),
          role: 'assistant',
          content: "Perfect! 🎉 I've created your personalized weekly plan and saved it for you. You can now check the 'Weekly Plan' tab to see your complete Monday-Friday schedule with all the details we discussed. Your week is going to be productive and well-balanced! 😊"
        };

        await chatsCollection.updateOne(
          { sessionId },
          {
            $push: { messages: confirmationMessage as any } // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        );
      }
    }

    // Now add Bella's response to session with the final message
    const bellaMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: new Date(),
      role: 'assistant',
      content: finalMessage
    };

    await chatsCollection.updateOne(
      { sessionId },
      {
        $push: { messages: bellaMessage as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
        $inc: { iteration: 1 }
      }
    );

    return NextResponse.json({
      success: true,
      bellaResponse: finalMessage,
      sessionId
    });

  } catch (error) {
    console.error('Chat handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}