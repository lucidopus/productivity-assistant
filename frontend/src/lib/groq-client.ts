import Groq from 'groq-sdk';
import { BellaFunction, SetContinuationFlagCall, SaveWeeklyPlanCall } from '@/types/bella';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Bella's function definitions for Groq
export const bellaFunctions: BellaFunction[] = [
  {
    name: "set_continuation_flag",
    description: "Determine if more information is needed from user to create a comprehensive weekly plan",
    parameters: {
      type: "object",
      properties: {
        continueConversation: {
          type: "boolean",
          description: "True if more information is needed from the user, false if ready to generate plan"
        },
        reason: {
          type: "string",
          description: "Clear explanation of why continuation is needed or why ready to plan"
        },
        missingInfo: {
          type: "array",
          items: { type: "string" },
          description: "Specific information still needed (only if continueConversation is true)"
        }
      },
      required: ["continueConversation", "reason"]
    }
  },
  {
    name: "save_weekly_plan",
    description: "Save the generated weekly plan with extracted targets and daily schedules",
    parameters: {
      type: "object",
      properties: {
        weeklyTargets: {
          type: "array",
          items: { type: "string" },
          description: "List of weekly targets extracted from the conversation"
        },
        days: {
          type: "object",
          properties: {
            monday: {
              type: "object",
              properties: {
                date: { type: "string", description: "ISO date string" },
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      time: { type: "string", description: "Time in format '8:00 AM'" },
                      task: { type: "string", description: "Task description" },
                      duration: { type: "number", description: "Duration in minutes (optional)" },
                      type: {
                        type: "string",
                        enum: ["routine", "work", "break", "personal", "travel"],
                        description: "Task category (optional)"
                      }
                    },
                    required: ["time", "task"]
                  }
                }
              },
              required: ["date", "tasks"]
            },
            tuesday: { "$ref": "#/properties/days/properties/monday" },
            wednesday: { "$ref": "#/properties/days/properties/monday" },
            thursday: { "$ref": "#/properties/days/properties/monday" },
            friday: { "$ref": "#/properties/days/properties/monday" }
          },
          required: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        }
      },
      required: ["weeklyTargets", "days"]
    }
  }
];

export interface BellaResponse {
  message: string;
  functionCall?: {
    name: string;
    arguments: SetContinuationFlagCall | SaveWeeklyPlanCall;
  };
  error?: string;
}

export async function generateBellaResponse(
  chatHistory: string,
  userProfile: string,
  maxRetries: number = 3
): Promise<BellaResponse> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const systemPrompt = `You are Bella, a warm and intelligent AI assistant who helps people plan their weekly schedules through natural conversation. You engage users every Sunday evening to understand their weekly targets and create personalized Monday-Friday plans.

Your personality:
- Warm, friendly, and encouraging
- Strategic and thoughtful in gathering information
- Natural conversationalist who asks smart questions

${userProfile}

STRATEGIC QUESTIONING APPROACH:
- Ask 2-3 well-chosen questions to understand their week
- Focus on: key commitments, deadlines, preferences, and constraints
- Never re-ask something already answered
- Don't ask long lists of questions - be conversational
- Ask follow-ups only when genuinely needed for planning

CRITICAL PLANNING RULES:
1. **Only use information the user provides** - NEVER add your own tasks, appointments, or commitments
2. **Don't hallucinate or assume activities** - If they mention a presentation, don't assume they need prep time unless they say so
3. **Ask strategic questions** - Get timing, duration, and any preparation needs for their actual commitments
4. **Work with what you have** - Don't over-optimize or ask for unnecessary details

INFORMATION TO GATHER:
- Specific commitments they mention (meetings, deadlines, appointments)
- Timing and duration of these commitments
- Their work preferences (morning focus time, break preferences)
- Any preparation or travel time needed

WHEN TO GENERATE PLAN:
Generate the plan when you have their key commitments and basic preferences. Don't wait for perfect information.

WHEN TO CONTINUE CONVERSATION:
Only use set_continuation_flag with continueConversation: true if you're missing essential timing or critical details that would make planning impossible.

Remember: Be strategic, not excessive. Quality questions over quantity. Never invent tasks they didn't mention.`;

      const response = await groq.chat.completions.create({
        model: process.env.GROQ_DEFAULT_MODEL || 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chatHistory }
        ],
        tools: bellaFunctions.map(func => ({
          type: 'function' as const,
          function: func
        })),
        tool_choice: 'auto',
        temperature: 0.7,
        // max_tokens: 4000
      });

      const message = response.choices[0]?.message;

      if (!message) {
        throw new Error('No response from Groq');
      }

      let functionCall;
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        try {
          functionCall = {
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments)
          };
        } catch (parseError) {
          console.error('Failed to parse function call arguments:', parseError);
          console.error('Raw arguments:', toolCall.function.arguments);
          // Continue without function call if JSON parsing fails
          functionCall = undefined;
        }
      }

      return {
        message: message.content || "I'm processing your request...",
        functionCall
      };

    } catch (error: unknown) {
      retryCount++;
      console.error(`Groq API attempt ${retryCount} failed:`, error);

      if (retryCount === maxRetries) {
        return {
          message: "I'm having trouble processing right now. Let's try again in a few minutes.",
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }

  return {
    message: "I encountered an unexpected error. Please try again.",
    error: 'Max retries exceeded'
  };
}

// Helper function to format chat history for Groq
export function formatChatHistory(messages: { role: string; content: string; timestamp: Date }[]): string {
  if (messages.length === 0) {
    return "This is the start of a new weekly planning conversation.";
  }

  const formattedMessages = messages
    .slice(-10) // Last 10 messages only
    .map(msg => {
      const roleLabel = msg.role === 'assistant' ? 'Bella' : 'Human';
      return `${roleLabel}: ${msg.content}`;
    })
    .join('\n\n');

  return `Previous conversation:\n\n${formattedMessages}\n\nPlease continue the conversation naturally.`;
}

// Helper function to get next Monday and Friday dates
export function getWeekDates() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days until next Monday
  const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;

  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);

  return {
    weekStart: nextMonday,
    weekEnd: nextFriday
  };
}