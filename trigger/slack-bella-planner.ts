import { schedules, logger } from "@trigger.dev/sdk";
import { WebClient } from "@slack/web-api";
import { getChatsCollection } from "../frontend/src/lib/mongodb";
import { formatBellaInitialMessage } from "../frontend/src/lib/slack-formatter";
import { HARDCODED_USER_ID } from "../frontend/src/lib/constants";
import { ChatMessage } from "../frontend/src/types/bella";
import { BellaPrompts } from "../frontend/src/lib/prompts";

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Helper function to generate session ID (following repository pattern)
function generateSessionId(): string {
  return `slack_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Helper function to generate message ID (following repository pattern)
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Session initialization (following repository patterns)
async function initializeSlackConversation(
  sessionId: string,
  userId: string,
  channelId: string,
  threadTs: string
): Promise<void> {
  try {
    const chatsCollection = await getChatsCollection();

    const initialMessage: ChatMessage = {
      id: generateMessageId(),
      timestamp: new Date(),
      role: 'assistant',
      content: "Hi! I'm Bella, your AI planning assistant. Let's create an amazing week together! ✨\n\nTell me about your upcoming week - what goals do you want to achieve, any important deadlines, or commitments you need to plan around?"
    };

    const slackChatSession = {
      sessionId,
      userId,
      messages: [initialMessage],
      continuationFlag: true,
      iteration: 0,
      extractedTargets: [],
      status: 'active',
      createdAt: new Date(),
      // Slack-specific fields
      slackChannelId: channelId,
      slackThreadTs: threadTs,
      slackUserId: process.env.SLACK_USER_ID
    };

    await chatsCollection.insertOne(slackChatSession);
    logger.info("Slack conversation initialized", { sessionId, userId });

  } catch (error) {
    logger.error("Failed to initialize Slack conversation", {
      error: (error as Error).message,
      sessionId,
      userId
    });
    throw error;
  }
}

export const slackBellaPlanner = schedules.task({
  id: "slack-bella-planner",
  cron: "0 21 * * 0", // Every Sunday at 9 PM
  maxDuration: 900, // Following repository pattern: 15 minutes
  run: async () => {
    logger.info("Slack weekly planner task started", { timestamp: new Date() });

    try {
      const userId = process.env.SLACK_USER_ID!;
      const sessionId = generateSessionId();

      // 1. Open DM channel (following Slack API patterns)
      const dmResult = await slackClient.conversations.open({
        users: userId
      });

      if (!dmResult.ok || !dmResult.channel) {
        throw new Error(`Failed to open DM: ${dmResult.error}`);
      }

      logger.info("DM channel opened", {
        channelId: dmResult.channel.id,
        userId
      });

      // 2. Send initial message with Block Kit formatting
      const messageResult = await slackClient.chat.postMessage({
        channel: dmResult.channel.id!,
        blocks: formatBellaInitialMessage(),
        text: "🌟 Time for your weekly planning session!" // Fallback text
      });

      if (!messageResult.ok) {
        throw new Error(`Failed to send message: ${messageResult.error}`);
      }

      logger.info("Initial message sent", {
        channelId: dmResult.channel.id,
        messageTs: messageResult.ts
      });

      // 3. Create session in MongoDB (following repository pattern)
      await initializeSlackConversation(
        sessionId,
        HARDCODED_USER_ID,
        dmResult.channel.id!,
        messageResult.ts!
      );

      logger.info("Slack weekly planner initiated successfully", {
        sessionId,
        slackUserId: userId,
        channelId: dmResult.channel.id,
        messageTs: messageResult.ts
      });

      return {
        success: true,
        sessionId,
        channelId: dmResult.channel.id,
        messageTs: messageResult.ts,
        startedAt: new Date()
      };

    } catch (error) {
      logger.error("Slack weekly planner failed", {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      // Send error notification to Slack if possible
      try {
        const userId = process.env.SLACK_USER_ID;
        if (userId) {
          const dmResult = await slackClient.conversations.open({
            users: userId
          });

          if (dmResult.ok && dmResult.channel) {
            await slackClient.chat.postMessage({
              channel: dmResult.channel.id!,
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: "🔧 I encountered a technical issue starting our weekly planning session. Please try messaging me directly, or contact support if this persists."
                  }
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: `🤖 _Error occurred at ${new Date().toLocaleString()}_`
                    }
                  ]
                }
              ],
              text: "Weekly planning session failed to start"
            });
          }
        }
      } catch (notificationError) {
        logger.error("Failed to send error notification", {
          error: (notificationError as Error).message
        });
      }

      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
});