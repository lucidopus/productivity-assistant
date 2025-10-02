import { ChatGroq } from "@langchain/groq";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getTodayPlanTool, updateWeeklyPlanTool, rescheduleTaskTool, getCurrentWeekday } from "./daily-assistant-tools";
import { DailyConversation } from "@/types/daily";

// Re-export getCurrentWeekday for use in other modules
export { getCurrentWeekday };

// Initialize ChatGroq model with function calling support
// Use Llama 3.3 model which is the latest and recommended for function calling
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", // Latest model with superior tool use capabilities
  temperature: 0.7
});

// Define the prompt template with placeholders for chat history and agent scratchpad
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are Dave, a friendly and efficient daily assistant who helps people manage their day-to-day activities. You're practical, encouraging, and focused on getting things done.

Your personality:
- Practical and action-oriented
- Encouraging but not overly enthusiastic
- Clear and concise in communication
- Proactive in suggesting improvements
- Supportive when users feel overwhelmed

Current context:
- Today is {weekday}
- You have access to tools to get today's plan, update the weekly plan, and reschedule tasks
- You work alongside Bella AI who handles weekly planning (usually on Sundays)

Your capabilities:
1. Show today's schedule from the weekly plan
2. Help with task-related questions throughout the day
3. Mark tasks as completed and update the weekly plan
4. Intelligently reschedule incomplete tasks to other days in the week
5. Provide helpful productivity advice and task management suggestions

Guidelines:
- Always use tools when users ask about their schedule or want to make changes
- When rescheduling tasks, provide clear explanations about the new time slot
- Be proactive in suggesting time management improvements
- Keep responses focused and actionable
- Address users by name when appropriate

Communication style:
- "Let me check your schedule..."
- "I can help you reschedule that"
- "Here's what you have coming up today:"
- "That looks manageable" or "That's a packed day, let's prioritize"

Remember: You're Dave, the daily assistant. Bella handles the big picture weekly planning, you handle the day-to-day execution.`
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"]
]);

// Create the tools array
const tools = [getTodayPlanTool, updateWeeklyPlanTool, rescheduleTaskTool];

// Create the tool calling agent
export async function createDailyAgent() {
  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt
  });

  return new AgentExecutor({
    agent,
    tools,
    handleParsingErrors: (error: Error) => {
      console.error('Agent parsing error:', error);
      return "I encountered an error processing the tool response. Please try again.";
    },
    maxIterations: 5,           // Prevent infinite loops
    verbose: process.env.NODE_ENV === 'development', // Enable verbose logging in development
    returnIntermediateSteps: true // Return tool usage details
  });
}

// Create a singleton instance for reuse
let agentExecutorInstance: AgentExecutor | null = null;

export async function getAgentExecutor(): Promise<AgentExecutor> {
  if (!agentExecutorInstance) {
    agentExecutorInstance = await createDailyAgent();
  }
  return agentExecutorInstance;
}

// Helper function to format chat history for the agent
export function formatChatHistoryForAgent(
  conversations: DailyConversation[]
): BaseMessage[] {
  const messages: BaseMessage[] = [];

  for (const conversation of conversations) {
    messages.push(new HumanMessage(conversation.user_message.message));
    messages.push(new AIMessage(conversation.assistant_message.message));
  }

  return messages;
}

// Helper function to execute the agent with proper input formatting
export async function executeDailyAgent(
  input: string,
  chatHistory: BaseMessage[] = []
): Promise<{
  output: string;
  intermediateSteps?: Array<{
    action: {
      tool: string;
      toolInput: Record<string, unknown>;
      log?: string;
    };
    observation: unknown;
  }>;
}> {
  try {
    const agentExecutor = await getAgentExecutor();
    const currentWeekday = getCurrentWeekday();

    const result = await agentExecutor.invoke({
      input,
      chat_history: chatHistory,
      weekday: currentWeekday
    });

    return {
      output: result.output,
      intermediateSteps: result.intermediateSteps
    };
  } catch (error) {
    console.error('Daily agent execution error:', error);

    // Return a graceful error response
    return {
      output: "I'm sorry, I encountered an issue processing your request. Please try again or rephrase your question.",
      intermediateSteps: []
    };
  }
}

// Helper function to determine if a message should be handled by daily vs weekly assistant
export function shouldUseDailyAssistant(message: string, timestamp: Date): boolean {
  const hour = timestamp.getHours();
  const day = timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Sunday evening (7 PM onwards) = weekly planning
  if (day === 0 && hour >= 19) return false;

  // Check for daily-specific keywords
  const dailyKeywords = /\b(today|daily|schedule|reschedule|morning|tonight|task|complete|done|finished|progress|status)\b/i;
  const weeklyKeywords = /\b(weekly|week|plan|targets|goals|next week|bella)\b/i;

  if (dailyKeywords.test(message) && !weeklyKeywords.test(message)) {
    return true;
  }

  if (weeklyKeywords.test(message)) {
    return false;
  }

  // Default: weekdays = daily, weekends = weekly
  return (day >= 1 && day <= 5);
}

// Helper function to validate agent tools are working
export async function validateDailyAgent(): Promise<boolean> {
  try {
    const agentExecutor = await getAgentExecutor();

    // Simple test to ensure the agent is properly configured
    const testResult = await agentExecutor.invoke({
      input: "What tools do you have available?",
      chat_history: [],
      weekday: getCurrentWeekday()
    });

    return testResult.output.length > 0;
  } catch (error) {
    console.error('Daily agent validation failed:', error);
    return false;
  }
}