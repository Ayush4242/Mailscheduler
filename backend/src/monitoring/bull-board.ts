import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getEmailQueue } from '../infrastructure/queue/email-queue.js';
import { Request, Response, NextFunction } from 'express';

export function setupBullBoard() {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  try {
    const emailQueue = getEmailQueue();
    createBullBoard({
      queues: [new BullMQAdapter(emailQueue)],
      serverAdapter,
    });
  } catch (err: any) {
    console.warn('[Bull Board] Warning initializing queue adapter:', err.message);
  }

  const router = serverAdapter.getRouter();

  // Resilient error handler for Bull Board
  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Bull Board Error Caught]:', err.message);
    if (
      err.message?.includes('Redis') ||
      err.message?.includes('connect') ||
      err.code === 'ECONNREFUSED' ||
      err.message?.includes('closed')
    ) {
      return res.status(503).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bull Board — Redis Disconnected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 32px; border-radius: 16px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            h2 { color: #fb7185; margin-top: 0; font-size: 20px; }
            p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 24px; }
            .instructions { background: #0f172a; border: 1px solid #1e293b; padding: 16px; border-radius: 8px; text-align: left; font-size: 12px; color: #cbd5e1; }
            code { color: #818cf8; font-family: monospace; }
            a { color: #6366f1; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Redis Connection Required</h2>
            <p>Bull Board cannot render queue metrics because Redis is offline or unreachable.</p>
            <div class="instructions">
              <strong>Quick Resolution:</strong><br/><br/>
              <strong>Option 1 (Instant Cloud Redis):</strong><br/>
              Create a free database on <a href="https://console.upstash.com" target="_blank">Upstash.com</a> and paste the <code>REDIS_HOST</code> & <code>REDIS_PASSWORD</code> into <code>backend/.env</code>.<br/><br/>
              <strong>Option 2 (Local Windows):</strong><br/>
              Run <code>redis-server.exe</code> on your computer to listen on port 6379.
            </div>
          </div>
        </body>
        </html>
      `);
    }
    next(err);
  });

  return router;
}
