import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/db.js';
import { getRedisClient } from './config/redis.js';
import { getEmailQueue } from './infrastructure/queue/email-queue.js';
import { emailService } from './modules/emails/email.service.js';

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 ReachInbox API running on http://localhost:${PORT}`);
  console.log(`📊 Bull Board Queue Monitor: http://localhost:${PORT}/admin/queues`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log('====================================================');

  // Reconcile any orphaned/pending jobs that were in progress prior to server restart
  try {
    const recovered = await emailService.reconcilePendingEmails();
    if (recovered > 0) {
      console.log(`[Reconciliation] Successfully recovered and re-enqueued ${recovered} scheduled emails.`);
    }
  } catch (err: any) {
    console.warn(`[Startup Notice] Database reconciliation deferred (${err.message}).`);
  }
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by a previous running instance of the server.`);
    console.error(`To free port ${PORT}, run this command in your PowerShell:`);
    console.error(`  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  }
});

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully closing connections...`);
  server.close(async () => {
    try {
      const queue = getEmailQueue();
      await queue.close();
      const redis = getRedisClient();
      await redis.quit();
      await prisma.$disconnect();
      console.log('[Shutdown] All connections safely closed. Process exiting.');
      process.exit(0);
    } catch (err: any) {
      console.error('[Shutdown Error]', err.message);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
