import axios from 'axios';
import { prisma } from '../../config/db.js';
import { getRedisClient } from '../../config/redis.js';
import { config } from '../../config/index.js';

export class SlackService {
  /**
   * Sends a test ping to verify Slack channel delivery
   */
  async sendTestPing(userId: string): Promise<{ success: boolean; channel?: string; error?: string }> {
    const slackIntegration = await prisma.slackIntegration.findUnique({
      where: { userId },
    });

    const token = slackIntegration?.accessToken || config.slack.botToken;
    if (!token) {
      return { success: false, error: 'No Slack Bot Token configured in backend/.env' };
    }

    const channel = slackIntegration?.channelId || slackIntegration?.channelName || config.slack.channelId;
    const text = '🎉 *ReachInbox Scheduler Connected!* Your Slack integration is active and verified for rate-limit notifications.';

    try {
      if (token.startsWith('https://hooks.slack.com')) {
        await axios.post(token, { text });
        return { success: true, channel };
      }

      if (token.startsWith('xoxb-mock-token')) {
        console.log('[Slack Test Ping (Dev Mode)]:', text);
        return { success: true, channel: 'rate-limit-alerts' };
      }

      const res = await axios.post(
        'https://slack.com/api/chat.postMessage',
        { channel, text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.data.ok) {
        return { success: false, error: res.data.error || 'Slack API error' };
      }

      return { success: true, channel };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }

  /**
   * Sends a formatted Slack notification message to the user's integrated channel.
   * Deduplicates hourly rate limit alerts using Redis key so only 1 alert is sent per hour per sender.
   */
  async notifyRateLimitHit(userId: string, senderEmail: string, currentCount: number, maxLimit: number, resumeTime: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const currentHour = new Date().toISOString().slice(0, 13);
      const dedupeKey = `slack:dedupe:ratelimit:${userId}:${senderEmail}:${currentHour}`;

      // Set dedupe flag for 1 hour; returns null if already exists
      const isFirst = await redis.set(dedupeKey, 'sent', 'EX', 3600, 'NX');
      if (!isFirst) {
        return;
      }

      const slackIntegration = await prisma.slackIntegration.findUnique({
        where: { userId },
      });

      const token = slackIntegration?.accessToken || config.slack.botToken;
      if (!token) {
        console.log(`[Slack] No active Slack connection for user ${userId}. Rate limit notification skipped.`);
        return;
      }

      const messageText = `⚠️ *ReachInbox Hourly Limit Reached*\n• Sender: \`${senderEmail}\`\n• Quota: ${currentCount}/${maxLimit} emails sent this hour\n• Queued emails will automatically resume at: \`${resumeTime}\``;

      if (token.startsWith('https://hooks.slack.com')) {
        await axios.post(token, { text: messageText });
        console.log(`[Slack] Successfully posted rate limit warning via Webhook.`);
        return;
      }

      if (token.startsWith('xoxb-mock-token')) {
        console.log(`====================================================`);
        console.log(`🔔 [SLACK NOTIFICATION DISPATCHED]`);
        console.log(messageText);
        console.log(`====================================================`);
        return;
      }

      const channel = slackIntegration?.channelId || slackIntegration?.channelName || config.slack.channelId;
      const postRes = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel,
          text: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (postRes.data.ok) {
        console.log(`[Slack] Successfully posted rate limit alert to #${channel}!`);
      } else {
        console.warn(`[Slack API Notice] Failed to post: ${postRes.data.error}`);
      }
    } catch (err: any) {
      console.warn(`[Slack] Notification failed (${err.message}). Scheduling will proceed uninterrupted.`);
    }
  }
}

export const slackService = new SlackService();
