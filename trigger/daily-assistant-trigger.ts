import { task, schedules, logger } from "@trigger.dev/sdk";
import { getDailyConversationsCollection } from "../frontend/src/lib/mongodb";
import { getTodayPlanTool, getCurrentWeekday, getActiveWeeklyPlanId } from "../frontend/src/lib/daily-assistant-tools";
import { HARDCODED_USER_ID } from "../frontend/src/lib/constants";
import { WebClient } from "@slack/web-api";
import { formatDailyResponse } from "../frontend/src/lib/slack-formatter";
import { DailyBriefing } from "../frontend/src/types/daily";

// Initialize Slack client
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Helper function to format daily briefing message
function formatDailyBriefing(todaysPlan: any): string {
  if (!todaysPlan || !todaysPlan.tasks || todaysPlan.tasks.length === 0) {
    return `Good morning! 🌅

I don't see any specific tasks planned for today. This could be a great day to:
• Review your weekly goals and see what needs attention
• Plan some focused work time
• Take care of any pending items

Let me know if you'd like help organizing your day!`;
  }

  const { tasks, weekday } = todaysPlan;
  const taskCount = tasks.length;
  const estimatedDuration = tasks.reduce((total: number, task: any) => total + (task.duration || 60), 0);

  let briefing = `Good morning! 🌅 Here's your ${weekday} plan:\n\n`;

  // Show first 5 tasks, then summarize the rest
  const visibleTasks = tasks.slice(0, 5);
  const remainingTasks = tasks.slice(5);

  briefing += visibleTasks.map((task: any) => `• ${task.time}: ${task.task}`).join('\n');

  if (remainingTasks.length > 0) {
    briefing += `\n• ...and ${remainingTasks.length} more tasks`;
  }

  briefing += `\n\n📊 *Today's Overview:*`;
  briefing += `\n• ${taskCount} tasks planned`;
  briefing += `\n• ~${Math.round(estimatedDuration / 60)} hours estimated`;

  briefing += `\n\n💡 *Daily Tip:* I'm here throughout the day to help you reschedule tasks, mark things complete, or adjust your plan as needed. Just send me a message!`;

  return briefing;
}

// Helper function to send daily briefing to Slack
async function sendDailyBriefingToSlack(todaysPlan: any): Promise<void> {
  try {
    // For now, we'll need the user's DM channel ID
    // In a real implementation, you'd get this from user preferences or conversation history
    const channelId = process.env.SLACK_USER_CHANNEL_ID || 'D08G7DD5L0N'; // Fallback to a default DM channel

    const briefingMessage = formatDailyBriefing(todaysPlan);

    await slackClient.chat.postMessage({
      channel: channelId,
      blocks: formatDailyResponse(briefingMessage, ['get_today_plan']),
      text: briefingMessage // Fallback text
    });

    logger.info("Daily briefing sent to Slack", {
      channelId,
      tasksCount: todaysPlan?.tasks?.length || 0
    });

  } catch (error) {
    logger.error("Failed to send daily briefing to Slack", {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    // Don't throw - we want the daily briefing to be stored even if Slack fails
  }
}

// Helper function to generate conversation ID
function generateConversationId(): string {
  return `daily_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Main daily assistant scheduled task - runs weekday mornings at 8 AM
export const dailyAssistant = schedules.task({
  id: "daily-assistant",
  // cron: "0 8 * * 1-5", // Every weekday at 8 AM - Configure on dashboard
  maxDuration: 600, // 10 minutes
  run: async () => {
    logger.info("Daily assistant task started", { timestamp: new Date() });

    try {
      const userId = HARDCODED_USER_ID;
      const currentWeekday = getCurrentWeekday();

      logger.info("Daily assistant processing", {
        userId,
        weekday: currentWeekday,
        startTime: new Date().toISOString()
      });

      // Get today's plan using the same tool the agent uses
      const todaysPlan = await getTodayPlanTool.invoke({
        weekday: currentWeekday
      });

      logger.info("Retrieved today's plan", {
        success: todaysPlan.success,
        tasksCount: todaysPlan.tasks?.length || 0,
        weekday: currentWeekday
      });

      // Send daily briefing via Slack (follows existing patterns)
      await sendDailyBriefingToSlack(todaysPlan);

      // Get weekly plan ID for context
      const weeklyPlanId = await getActiveWeeklyPlanId(userId);

      // Store initial conversation following shopping-platform pattern
      const dailyConversations = await getDailyConversationsCollection();
      const conversationDoc = {
        user_id: userId,
        user_message: {
          type: 'system' as const,
          message: 'Daily check-in initiated automatically'
        },
        assistant_message: {
          type: 'assistant' as const,
          message: formatDailyBriefing(todaysPlan)
        },
        tool_usage: [{
          tool: 'get_today_plan' as const,
          toolInput: { weekday: currentWeekday },
          log: `Invoking "get_today_plan" with {"weekday":"${currentWeekday}"}`,
          output: todaysPlan
        }],
        timestamp: new Date(),
        weekday: currentWeekday,
        weekly_plan_id: weeklyPlanId,
        context: {
          tasks_completed: [],
          tasks_rescheduled: []
        }
      };

      await dailyConversations.insertOne(conversationDoc);

      logger.info("Daily assistant task completed successfully", {
        userId,
        weekday: currentWeekday,
        tasksCount: todaysPlan?.tasks?.length || 0,
        weeklyPlanId: weeklyPlanId ? 'linked' : 'not_found',
        completedAt: new Date().toISOString()
      });

      return {
        success: true,
        userId,
        weekday: currentWeekday,
        tasksCount: todaysPlan?.tasks?.length || 0,
        weeklyPlanId,
        briefingSent: true,
        completedAt: new Date()
      };

    } catch (error) {
      logger.error("Daily assistant task failed", {
        error: (error as Error).message,
        stack: (error as Error).stack,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date()
      };
    }
  }
});

// Manual daily briefing task (can be triggered for testing or on-demand)
export const manualDailyBriefing = task({
  id: "manual-daily-briefing",
  maxDuration: 300, // 5 minutes
  run: async (payload: { weekday?: string; userId?: string }) => {
    logger.info("Manual daily briefing task started", {
      payload,
      timestamp: new Date()
    });

    try {
      const userId = payload.userId || HARDCODED_USER_ID;
      const weekday = payload.weekday || getCurrentWeekday();

      // Get today's plan
      const todaysPlan = await getTodayPlanTool.invoke({
        weekday: weekday as any
      });

      // Send briefing
      await sendDailyBriefingToSlack(todaysPlan);

      // Store conversation
      const dailyConversations = await getDailyConversationsCollection();
      const weeklyPlanId = await getActiveWeeklyPlanId(userId);

      const conversationDoc = {
        user_id: userId,
        user_message: {
          type: 'system' as const,
          message: 'Manual daily briefing requested'
        },
        assistant_message: {
          type: 'assistant' as const,
          message: formatDailyBriefing(todaysPlan)
        },
        tool_usage: [{
          tool: 'get_today_plan' as const,
          toolInput: { weekday },
          log: `Manual invocation of "get_today_plan" with {"weekday":"${weekday}"}`,
          output: todaysPlan
        }],
        timestamp: new Date(),
        weekday: weekday as any,
        weekly_plan_id: weeklyPlanId
      };

      await dailyConversations.insertOne(conversationDoc);

      logger.info("Manual daily briefing completed", {
        userId,
        weekday,
        tasksCount: todaysPlan?.tasks?.length || 0
      });

      return {
        success: true,
        userId,
        weekday,
        tasksCount: todaysPlan?.tasks?.length || 0,
        briefingSent: true,
        triggeredAt: new Date()
      };

    } catch (error) {
      logger.error("Manual daily briefing failed", {
        error: (error as Error).message,
        payload
      });

      return {
        success: false,
        error: (error as Error).message,
        payload
      };
    }
  }
});