// Slack Bolt app setup with modern Assistant API integration
// Following repository patterns for error handling and logging

import { App } from '@slack/bolt';
import { formatBellaResponse, formatWeeklyPlan } from './slack-formatter';
import { processUserMessage, handleFunctionCall, handleSlackError } from './bella-slack-handler';

/**
 * Initialize Slack Bolt app with standard event handlers
 */
export const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true, // Important for webhook responses
});

/**
 * Handle direct messages to the bot
 */
slackApp.message(async ({ message, say, logger }) => {
  try {
    // Only process direct messages and exclude bot messages
    if (message.channel_type !== 'im' || message.subtype === 'bot_message') {
      return;
    }

    // Type guard to ensure we have a regular message with user
    if (!('user' in message) || !('text' in message)) {
      return;
    }

    logger.info('Processing direct message', {
      channel: message.channel,
      user: message.user,
      messageLength: message.text?.length || 0,
      timestamp: new Date()
    });

    // Convert to SlackMessage format
    const slackMessage = {
      text: message.text || '',
      channel: message.channel,
      user: message.user,
      ts: message.ts,
      thread_ts: ('thread_ts' in message) ? message.thread_ts : undefined
    };

    // Process through existing Bella logic
    const response = await processUserMessage(slackMessage, {
      channelId: message.channel,
      userId: message.user
    });

    // Send response with Block Kit formatting
    await say({
      blocks: formatBellaResponse(response.message),
      text: response.message // Fallback text
    });

    // Handle function calls (continuation/plan saving)
    if (response.functionCall) {
      logger.info('Handling function call', {
        functionName: response.functionCall.name,
        channel: message.channel
      });

      await handleFunctionCall(response.functionCall as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
        channelId: message.channel,
        userId: message.user
      });

      // If it's a weekly plan save, format and send the plan
      if (response.functionCall.name === 'save_weekly_plan') {
        const args = response.functionCall.arguments as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const weeklyPlan = {
          weeklyTargets: args.weeklyTargets as string[],
          days: args.days as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          weekStart: new Date(), // Would be calculated properly
          weekEnd: new Date(), // Would be calculated properly
          userId: message.user,
          sessionId: '', // Would be from context
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active' as const
        };

        await say({
          blocks: formatWeeklyPlan(weeklyPlan),
          text: "Your weekly plan is ready!"
        });
      }
    }

    logger.info('Message processed successfully', {
      channel: message.channel,
      user: message.user,
      responseLength: response.message.length,
      hasFunctionCall: !!response.functionCall
    });

  } catch (error) {
    logger.error('Message processing failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      channel: message.channel,
      user: ('user' in message) ? message.user : 'unknown'
    });

    await handleSlackError(error as Error, say as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
      channelId: message.channel,
      userId: ('user' in message && message.user) ? message.user : 'unknown'
    });
  }
});

/**
 * Handle button interactions (for weekly plan actions)
 */
slackApp.action('request_changes', async ({ ack, body, say, logger }) => {
  await ack();

  try {
    logger.info('Request changes button clicked', {
      user: body.user.id,
      channel: body.channel?.id
    });

    if (say) {
      await say({
        blocks: formatBellaResponse(
          "I'd be happy to help you adjust your weekly plan! What changes would you like to make? You can ask me to:\n\n" +
          "• Reschedule specific tasks\n" +
          "• Add more buffer time\n" +
          "• Adjust work-life balance\n" +
          "• Modify daily routines\n\n" +
          "Just tell me what you'd like to change!"
        ),
        text: "What changes would you like to make to your plan?"
      });
    }

  } catch (error) {
    logger.error('Button interaction failed', {
      error: (error as Error).message,
      action: 'request_changes'
    });
  }
});

/**
 * Handle app mentions (fallback for non-Assistant interactions)
 */
slackApp.event('app_mention', async ({ event, say, logger }) => {
  try {
    logger.info('App mentioned', {
      user: event.user,
      channel: event.channel,
      text: event.text
    });

    if (say) {
      await say({
        blocks: formatBellaResponse(
          "Hi! I'm Bella, your AI planning assistant. For the best experience, please start a new conversation with me in DMs where I can help you create an amazing weekly plan! ✨"
        ),
        text: "Hi! I'm Bella, your AI planning assistant. DM me to start planning your week!"
      });
    }

  } catch (error) {
    logger.error('App mention handling failed', {
      error: (error as Error).message,
      user: event.user,
      channel: event.channel
    });
  }
});

/**
 * Global error handler
 */
slackApp.error(async (error) => {
  console.error('Slack app global error:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date()
  });
});

// Export app for use in webhook endpoint
export default slackApp;