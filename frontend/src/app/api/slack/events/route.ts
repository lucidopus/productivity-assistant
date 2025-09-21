import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { processUserMessage, handleFunctionCall } from '@/lib/bella-slack-handler';
import { formatBellaResponse, formatWeeklyPlan } from '@/lib/slack-formatter';
import { WebClient } from '@slack/web-api';
import { SaveWeeklyPlanCall } from '@/types/bella';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Simple in-memory cache for event deduplication
const processedEvents = new Set<string>();

// Clean up old events every 5 minutes
setInterval(() => {
  processedEvents.clear();
}, 5 * 60 * 1000);

/**
 * Verifies Slack signature to ensure request authenticity
 * Includes replay attack protection with 5-minute window
 */
function verifySlackSignature(signature: string, timestamp: string, body: string): boolean {
  // Prevent replay attacks (5-minute window)
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 300) return false;

  const hmac = createHmac('sha256', process.env.SLACK_SIGNING_SECRET!);
  const [version, hash] = signature.split('=');
  const expectedSignature = hmac.update(`${version}:${timestamp}:${body}`).digest('hex');

  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedSignature, 'hex'));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const payload = JSON.parse(body);

    // Handle URL verification (required by Slack) - BEFORE signature verification
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Enhanced security verification for actual events
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');

    if (!signature || !timestamp || !verifySlackSignature(signature, timestamp, body)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle different event types
    if (payload.event) {
      console.log('Slack event received:', {
        type: payload.event.type,
        user: payload.event.user,
        bot_id: payload.event.bot_id,
        subtype: payload.event.subtype,
        channel: payload.event.channel,
        timestamp: new Date()
      });

      // Process direct messages to Bella (ignore bot messages and message subtypes)
      if (payload.event.type === 'message' &&
          payload.event.channel_type === 'im' &&
          payload.event.user !== 'U09GA8D34TG' && // Bella's bot user ID
          !payload.event.bot_id && // Ignore messages from bots
          !payload.event.subtype && // Ignore message edits, deletes, etc.
          payload.event.text) { // Ensure there's actual text content

        // Event deduplication
        const eventKey = `${payload.event.channel}-${payload.event.ts}`;
        if (processedEvents.has(eventKey)) {
          console.log('Skipping duplicate event:', eventKey);
          return NextResponse.json({ ok: true });
        }
        processedEvents.add(eventKey);

        try {
          console.log('Processing user message:', payload.event.text);

          // Process through Bella conversation handler
          const response = await processUserMessage(
            {
              text: payload.event.text,
              channel: payload.event.channel,
              user: payload.event.user,
              ts: payload.event.ts
            },
            {
              channelId: payload.event.channel,
              userId: payload.event.user
            }
          );

          console.log('Bella response generated:', response.message);

          // Send message to Slack if there's actual content (excluding processing message)
          if (response.message && response.message !== "I'm processing your request...") {
            await slackClient.chat.postMessage({
              channel: payload.event.channel,
              blocks: formatBellaResponse(response.message),
              text: response.message // Fallback text
            });
          }

          // Handle function calls (continuation/plan saving)
          if (response.functionCall) {
            console.log('Handling function call:', response.functionCall.name);

            await handleFunctionCall({
              name: response.functionCall.name,
              arguments: response.functionCall.arguments as unknown as Record<string, unknown>
            }, {
              channelId: payload.event.channel,
              userId: payload.event.user
            });

            // If it's a weekly plan save, format and send the plan
            if (response.functionCall.name === 'save_weekly_plan') {
              const weeklyPlan = {
                weeklyTargets: (response.functionCall.arguments as SaveWeeklyPlanCall).weeklyTargets,
                days: (response.functionCall.arguments as SaveWeeklyPlanCall).days,
                weekStart: new Date(),
                weekEnd: new Date(),
                userId: payload.event.user,
                sessionId: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active' as const
              };

              await slackClient.chat.postMessage({
                channel: payload.event.channel,
                blocks: formatWeeklyPlan(weeklyPlan),
                text: "Your weekly plan is ready!"
              });
            }
          }

        } catch (error) {
          console.error('Error processing message:', error);

          // Send error message to user
          await slackClient.chat.postMessage({
            channel: payload.event.channel,
            blocks: formatBellaResponse("I encountered an issue processing your message. Let me try again - could you please rephrase your request?"),
            text: "Sorry, I encountered an issue. Please try again."
          });
        }
      } else if (payload.event.type === 'message' && payload.event.channel_type === 'im') {
        // Log why we're skipping this message
        const reasons = [];
        if (payload.event.user === 'U09GA8D34TG') reasons.push('is bot user');
        if (payload.event.bot_id) reasons.push('has bot_id');
        if (payload.event.subtype) reasons.push(`has subtype: ${payload.event.subtype}`);
        if (!payload.event.text) reasons.push('no text content');
        console.log('Skipping message:', reasons.join(', '));
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}