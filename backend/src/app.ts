import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { setupBullBoard } from './monitoring/bull-board.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Controllers
import { authController } from './modules/auth/auth.controller.js';
import { emailController } from './modules/emails/email.controller.js';
import { campaignController } from './modules/campaigns/campaign.controller.js';
import { slackController } from './modules/slack/slack.controller.js';

const app = express();

// Middleware setup
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

// Health Check Endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    services: {
      api: 'healthy',
      queue: 'ready',
    },
  });
});

// Bull Board (live monitoring)
app.get('/admin/queues', (req, res, next) => {
  if (!req.originalUrl.endsWith('/')) {
    return res.redirect(301, '/admin/queues/');
  }
  next();
});
app.use('/admin/queues', setupBullBoard());

// Auth Endpoints
app.post('/api/auth/signup', (req, res) => authController.signup(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/auth/google', (req, res) => authController.getGoogleAuthUrl(req, res));
app.get('/api/auth/google/callback', (req, res) => authController.googleCallback(req, res));
app.get('/api/auth/me', requireAuth, (req, res) => authController.getMe(req, res));
app.post('/api/auth/logout', (req, res) => authController.logout(req, res));

// Email Endpoints
app.post('/api/emails/schedule', requireAuth, (req, res) => emailController.scheduleSingle(req, res));
app.get('/api/emails/scheduled', requireAuth, (req, res) => emailController.getScheduled(req, res));
app.get('/api/emails/sent', requireAuth, (req, res) => emailController.getSent(req, res));
app.get('/api/emails/search', requireAuth, (req, res) => emailController.search(req, res));

// Campaign Endpoints
app.post('/api/campaigns', requireAuth, (req, res) => campaignController.schedule(req, res));
app.get('/api/campaigns', requireAuth, (req, res) => campaignController.list(req, res));

// Slack Endpoints
app.get('/api/slack/oauth', requireAuth, (req, res) => slackController.getOAuthUrl(req, res));
app.get('/api/slack/oauth/callback', (req, res) => slackController.callback(req, res));
app.post('/api/slack/dev-connect', requireAuth, (req, res) => slackController.devConnect(req, res));
app.post('/api/slack/connect-manual', requireAuth, (req, res) => slackController.connectManual(req, res));
app.post('/api/slack/test-message', requireAuth, (req, res) => slackController.sendTestMessage(req, res));
app.get('/api/slack/status', requireAuth, (req, res) => slackController.status(req, res));
app.delete('/api/slack/disconnect', requireAuth, (req, res) => slackController.disconnect(req, res));

// Centralized Error Handling
app.use(errorHandler);

export default app;
