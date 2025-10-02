// Block Kit message formatting utilities for Slack integration
// Following Slack's Block Kit best practices for rich messaging

import { WeeklyPlan } from '@/types/bella';

// Slack Block Kit types
type SlackBlock = {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text?: string;
  }>;
};

/**
 * Formats Bella's initial message with professional Block Kit layout
 */
export function formatBellaInitialMessage(): SlackBlock[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "It's time to plan your week",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Hi Harshil! Let's create an amazing week together! ✨\n\nTell me about your upcoming week - what goals do you want to achieve, any important deadlines, or commitments you need to plan around?"
      }
    },
  ];
}

/**
 * Formats Bella's response messages with consistent styling
 */
export function formatBellaResponse(message: string): SlackBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: message
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "🤖 _AI Assistant Response_"
        }
      ]
    }
  ];
}

/**
 * Formats weekly plan with rich Block Kit layout including expandable sections
 */
export function formatWeeklyPlan(plan: WeeklyPlan): SlackBlock[] {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "📅 Your Weekly Plan",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Week of ${new Date(plan.weekStart).toLocaleDateString()} - ${new Date(plan.weekEnd).toLocaleDateString()}*`
      }
    }
  ];

  // Weekly targets section
  if (plan.weeklyTargets && plan.weeklyTargets.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🎯 Weekly Targets:*\n" + plan.weeklyTargets.map(target => `• ${target}`).join('\n')
      }
    });
  }

  blocks.push({ type: "divider" } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Daily schedules (first 3 tasks per day + expansion indicator)
  const dayEmojis: { [key: string]: string } = {
    monday: '📝',
    tuesday: '🔥',
    wednesday: '⚡',
    thursday: '🚀',
    friday: '🎉'
  };

  Object.entries(plan.days).forEach(([day, dayPlan]) => {
    const dayEmoji = dayEmojis[day] || '📅';
    const visibleTasks = dayPlan.tasks.slice(0, 3);
    const remainingCount = dayPlan.tasks.length - 3;

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${dayEmoji} ${day.charAt(0).toUpperCase() + day.slice(1)}* (${new Date(dayPlan.date).toLocaleDateString()})\n` +
              visibleTasks.map(task => `${task.time}: ${task.task}`).join('\n') +
              (remainingCount > 0 ? `\n_+${remainingCount} more tasks_` : '')
      }
    });
  });

  // Action buttons
  blocks.push(
    { type: "divider" } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📖 View Full Plan"
          },
          url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/bella` : "https://localhost:3007/bella",
          action_id: "view_full_plan"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "🔄 Request Changes"
          },
          action_id: "request_changes",
          style: "primary"
        }
      ]
    } as any // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  return blocks;
}

/**
 * Formats error messages with user-friendly styling
 */
export function formatErrorMessage(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _error: string
): SlackBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "🔧 I encountered a technical issue. Let me try that again in a moment..."
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "🤖 _If this persists, try saying 'restart' to begin a new conversation_"
        }
      ]
    }
  ];
}

/**
 * Formats a loading/processing message
 */
export function formatProcessingMessage(): SlackBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "🤔 Thinking... I'm processing your request and will respond shortly."
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "🤖 _AI is generating your response_"
        }
      ]
    }
  ];
}

/**
 * Formats daily assistant responses with tool usage indicators
 */
export function formatDailyResponse(message: string, toolsUsed: string[] = []): SlackBlock[] {
  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: message
      }
    }
  ];

  if (toolsUsed.length > 0) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🔧 _Used: ${toolsUsed.join(', ')}_`
        }
      ]
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "📱 _Daily Assistant_"
      }
    ]
  });

  return blocks;
}