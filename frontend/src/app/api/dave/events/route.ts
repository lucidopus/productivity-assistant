import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { formatDailyResponse, formatErrorMessage } from '@/lib/slack-formatter';
import { HARDCODED_USER_ID } from '@/lib/constants';
import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.DAVE_SLACK_BOT_TOKEN);

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

  const hmac = createHmac('sha256', process.env.DAVE_SLACK_SIGNING_SECRET!);
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
      console.log('Dave Slack event received:', {
        type: payload.event.type,
        user: payload.event.user,
        bot_id: payload.event.bot_id,
        subtype: payload.event.subtype,
        channel: payload.event.channel,
        timestamp: new Date()
      });

      // Process direct messages to Dave (ignore bot messages and message subtypes)
      if (payload.event.type === 'message' &&
          payload.event.channel_type === 'im' &&
          payload.event.user !== process.env.DAVE_SLACK_USER_ID && // Dave's bot user ID
          !payload.event.bot_id && // Ignore messages from bots
          !payload.event.subtype && // Ignore message edits, deletes, etc.
          payload.event.text) { // Ensure there's actual text content

        // Event deduplication
        const eventKey = `${payload.event.channel}-${payload.event.ts}`;
        if (processedEvents.has(eventKey)) {
          console.log('Dave: Skipping duplicate event:', eventKey);
          return NextResponse.json({ ok: true });
        }
        processedEvents.add(eventKey);

        try {
          console.log('Dave: Processing user message:', payload.event.text);

          // Call daily assistant API directly (no routing needed - Dave only does daily)
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/daily-assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: payload.event.text,
              userId: HARDCODED_USER_ID
            })
          });

          const result = await response.json();

          if (result.success) {
            await slackClient.chat.postMessage({
              channel: payload.event.channel,
              blocks: formatDailyResponse(result.message, result.tools_used),
              text: result.message
            });
          } else {
            throw new Error(`Daily assistant error: ${result.error}`);
          }

        } catch (error) {
          console.error('Dave: Error processing message:', error);

          // Send error message to user
          await slackClient.chat.postMessage({
            channel: payload.event.channel,
            blocks: formatErrorMessage(error instanceof Error ? error.message : 'Unknown error'),
            text: "Sorry, I encountered an issue. Please try again."
          });
        }
      } else if (payload.event.type === 'message' && payload.event.channel_type === 'im') {
        // Log why we're skipping this message
        const reasons = [];
        if (payload.event.user === process.env.DAVE_SLACK_USER_ID) reasons.push('is Dave bot user');
        if (payload.event.bot_id) reasons.push('has bot_id');
        if (payload.event.subtype) reasons.push(`has subtype: ${payload.event.subtype}`);
        if (!payload.event.text) reasons.push('no text content');
        console.log('Dave: Skipping message:', reasons.join(', '));
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Dave Slack webhook error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}