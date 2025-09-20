import Groq from 'groq-sdk';
import { BellaFunction, SetContinuationFlagCall, SaveWeeklyPlanCall } from '@/types/bella';
import {
  generateBellaSystemPrompt,
  formatChatHistoryPrompt,
  ErrorPrompts
} from './prompts';

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
      const systemPrompt = generateBellaSystemPrompt(userProfile);

      // DEBUG: Log the complete prompt being sent to the LLM
      console.log('='.repeat(80));
      console.log('🔍 DEBUG: COMPLETE PROMPT BEING SENT TO LLM');
      console.log('='.repeat(80));
      console.log('\n📋 SYSTEM PROMPT:');
      console.log('-'.repeat(40));
      console.log(systemPrompt);
      console.log('-'.repeat(40));
      console.log('\n💬 USER MESSAGE (Chat History):');
      console.log('-'.repeat(40));
      console.log(chatHistory);
      console.log('-'.repeat(40));
      console.log('\n🔧 MODEL:', process.env.GROQ_DEFAULT_MODEL || 'llama-3.1-70b-versatile');
      console.log('🌡️  TEMPERATURE:', 0.7);
      console.log('🛠️  TOOLS ENABLED:', bellaFunctions.map(f => f.name).join(', '));
      console.log('='.repeat(80));
      console.log('\n');

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

      // DEBUG: Log the LLM response
      console.log('='.repeat(80));
      console.log('✅ DEBUG: LLM RESPONSE RECEIVED');
      console.log('='.repeat(80));
      console.log('\n📝 Message Content:');
      console.log('-'.repeat(40));
      console.log(message.content || '[No text content]');
      console.log('-'.repeat(40));

      let functionCall;
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        console.log('\n🔧 Function Call Detected:');
        console.log('  Function Name:', toolCall.function.name);
        console.log('  Raw Arguments:', toolCall.function.arguments);
        try {
          functionCall = {
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments)
          };
          console.log('  Parsed Arguments:', JSON.stringify(functionCall.arguments, null, 2));
        } catch (parseError) {
          console.error('Failed to parse function call arguments:', parseError);
          console.error('Raw arguments:', toolCall.function.arguments);
          // Continue without function call if JSON parsing fails
          functionCall = undefined;
        }
      } else {
        console.log('\n🔧 No function calls in response');
      }
      console.log('='.repeat(80));
      console.log('\n');

      return {
        message: message.content || ErrorPrompts.processingMessage.template,
        functionCall
      };

    } catch (error: unknown) {
      retryCount++;
      console.error(`Groq API attempt ${retryCount} failed:`, error);

      if (retryCount === maxRetries) {
        return {
          message: ErrorPrompts.apiError.template,
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
    message: ErrorPrompts.maxRetriesError.template,
    error: 'Max retries exceeded'
  };
}

// Helper function to format chat history for Groq
export function formatChatHistory(messages: { role: string; content: string; timestamp: Date }[]): string {
  return formatChatHistoryPrompt(messages);
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