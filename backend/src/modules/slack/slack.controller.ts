import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../../config/db.js';
import { config } from '../../config/index.js';

export class SlackController {
  /**
   * Generates Slack OAuth authorization URL
   */
  async getOAuthUrl(req: Request, res: Response) {
    if (!config.slack.clientId) {
      // Redirect back to dashboard with a clean error parameter instead of dumping raw JSON
      return res.redirect(`${config.clientUrl}/dashboard?slack_error=not_configured`);
    }

    const state = req.user?.id || 'anonymous';
    const scope = 'chat:write,channels:read,incoming-webhook';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${config.slack.clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(
      config.slack.redirectUri
    )}&state=${state}`;

    return res.redirect(url);
  }

  /**
   * Slack OAuth Callback
   */
  async callback(req: Request, res: Response) {
    const code = req.query.code as string;
    const stateUserId = req.query.state as string;

    if (!code) {
      return res.redirect(`${config.clientUrl}/dashboard?slack_error=missing_code`);
    }

    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        new URLSearchParams({
          code,
          client_id: config.slack.clientId,
          client_secret: config.slack.clientSecret,
          redirect_uri: config.slack.redirectUri,
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slack OAuth authorization failed');
      }

      const { access_token, team, incoming_webhook, authed_user } = response.data;

      if (stateUserId && stateUserId !== 'anonymous') {
        await prisma.slackIntegration.upsert({
          where: { userId: stateUserId },
          update: {
            accessToken: access_token,
            teamId: team?.id || 'unknown',
            teamName: team?.name || 'Workspace',
            channelId: incoming_webhook?.channel_id,
            channelName: incoming_webhook?.channel,
            botUserId: authed_user?.id,
          },
          create: {
            userId: stateUserId,
            accessToken: access_token,
            teamId: team?.id || 'unknown',
            teamName: team?.name || 'Workspace',
            channelId: incoming_webhook?.channel_id,
            channelName: incoming_webhook?.channel,
            botUserId: authed_user?.id,
          },
        });
      }

      return res.redirect(`${config.clientUrl}/dashboard?slack_connected=true`);
    } catch (err: any) {
      console.error('[Slack OAuth Error]', err.message);
      return res.redirect(`${config.clientUrl}/dashboard?slack_error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Connect via Webhook or Bot Token directly from the Dashboard
   */
  async connectManual(req: Request, res: Response) {
    const userId = req.user!.id;
    const { webhookUrl, botToken, channelName, teamName } = req.body;

    if (!webhookUrl && !botToken) {
      return res.status(400).json({ error: 'Please provide either a Slack Webhook URL or Bot Token.' });
    }

    try {
      // Test the webhook or token with a real test message
      if (webhookUrl) {
        await axios.post(webhookUrl, {
          text: '🎉 *ReachInbox Scheduler Connected!* This channel will now receive rate-limit and delivery notifications.',
        });
      } else if (botToken) {
        await axios.post(
          'https://slack.com/api/chat.postMessage',
          {
            channel: channelName || '#general',
            text: '🎉 *ReachInbox Scheduler Connected!* This channel will now receive rate-limit and delivery notifications.',
          },
          {
            headers: { Authorization: `Bearer ${botToken}` },
          }
        );
      }

      const integration = await prisma.slackIntegration.upsert({
        where: { userId },
        update: {
          accessToken: botToken || webhookUrl,
          teamId: 'manual',
          teamName: teamName || 'Slack Workspace',
          channelName: channelName || (webhookUrl ? 'webhook-channel' : 'general'),
        },
        create: {
          userId,
          accessToken: botToken || webhookUrl,
          teamId: 'manual',
          teamName: teamName || 'Slack Workspace',
          channelName: channelName || (webhookUrl ? 'webhook-channel' : 'general'),
        },
      });

      return res.json({ success: true, integration });
    } catch (err: any) {
      console.error('[Manual Slack Error]', err.message);
      return res.status(400).json({
        error: `Could not verify Slack connection (${err.response?.data?.error || err.message}). Please check the URL or token.`,
      });
    }
  }

  /**
   * Connect Demo Slack Channel for local testing when credentials are pending
   */
  async devConnect(req: Request, res: Response) {
    const userId = req.user!.id;

    const integration = await prisma.slackIntegration.upsert({
      where: { userId },
      update: {
        accessToken: 'xoxb-mock-token-for-dev',
        teamId: 'T_DEMO_WORKSPACE',
        teamName: 'ReachInbox Demo Team',
        channelId: 'C_DEV_ALERTS',
        channelName: 'rate-limit-alerts',
      },
      create: {
        userId,
        accessToken: 'xoxb-mock-token-for-dev',
        teamId: 'T_DEMO_WORKSPACE',
        teamName: 'ReachInbox Demo Team',
        channelId: 'C_DEV_ALERTS',
        channelName: 'rate-limit-alerts',
      },
    });

    return res.json({ success: true, integration });
  }

  /**
   * Get Slack integration status
   */
  async status(req: Request, res: Response) {
    const userId = req.user!.id;
    let integration = await prisma.slackIntegration.findUnique({
      where: { userId },
      select: {
        id: true,
        teamName: true,
        channelName: true,
        createdAt: true,
      },
    });

    // Auto-link bot token from .env if present
    if (!integration && config.slack.botToken) {
      integration = await prisma.slackIntegration.upsert({
        where: { userId },
        update: {
          accessToken: config.slack.botToken,
          teamId: 'T0CBQ0QL97V',
          teamName: 'xyz Workspace',
          channelId: config.slack.channelId,
          channelName: config.slack.channelId,
        },
        create: {
          userId,
          accessToken: config.slack.botToken,
          teamId: 'T0CBQ0QL97V',
          teamName: 'xyz Workspace',
          channelId: config.slack.channelId,
          channelName: config.slack.channelId,
        },
        select: {
          id: true,
          teamName: true,
          channelName: true,
          createdAt: true,
        },
      });
    }

    return res.json({
      connected: !!integration,
      integration,
    });
  }

  /**
   * Send test notification to verified channel
   */
  async sendTestMessage(req: Request, res: Response) {
    const userId = req.user!.id;
    const { slackService } = await import('./slack.service.js');
    const result = await slackService.sendTestPing(userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, message: `Notification sent to #${result.channel}!` });
  }

  /**
   * Disconnect Slack
   */
  async disconnect(req: Request, res: Response) {
    const userId = req.user!.id;
    await prisma.slackIntegration.deleteMany({
      where: { userId },
    });

    return res.json({ success: true, message: 'Slack integration disconnected successfully.' });
  }
}

export const slackController = new SlackController();
