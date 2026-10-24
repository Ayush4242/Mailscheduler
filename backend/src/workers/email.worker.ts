import { Worker, Job } from 'bullmq';
import { EMAIL_QUEUE_NAME, EmailJobData, getEmailQueue } from '../infrastructure/queue/email-queue.js';
import { getRedisClient } from '../config/redis.js';
import { emailRepository } from '../modules/emails/email.repository.js';
import { etherealTransport } from '../infrastructure/email/ethereal-transport.js';
import { rateLimiter } from '../infrastructure/rate-limiting/rate-limiter.js';
import { slackService } from '../modules/slack/slack.service.js';
import { searchService } from '../modules/search/search.service.js';
import { config } from '../config/index.js';
import { EmailStatus } from '@prisma/client';

export function startEmailWorker() {
  const redis = getRedisClient();
  const concurrency = config.worker.concurrency;

  console.log(`[Worker] Starting Email Worker with concurrency = ${concurrency}...`);

  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { scheduledEmailId, userId, recipient, subject, body, hourlyLimit } = job.data;
      console.log(`[Worker Job ${job.id}] Processing email delivery for ID: ${scheduledEmailId} -> ${recipient}`);

      // 1. Fetch record from DB to verify eligibility and guarded status transitions
      const emailRecord = await emailRepository.findById(scheduledEmailId);
      if (!emailRecord) {
        console.warn(`[Worker Job ${job.id}] Record ${scheduledEmailId} not found in DB. Skipping.`);
        return;
      }

      // Idempotency: If already marked as SENT, do not duplicate send
      if (emailRecord.status === EmailStatus.SENT) {
        console.log(`[Worker Job ${job.id}] Email ${scheduledEmailId} is already marked as SENT. Idempotency guard triggered.`);
        return;
      }

      const senderEmail = emailRecord.senderAccount?.email || emailRecord.user?.email || 'default-sender';
      const senderKey = `${userId}:${senderEmail}`;

      // 2. Check distributed hourly rate limit
      const rateLimitCheck = await rateLimiter.checkAndConsumeHourlyLimit(senderKey, hourlyLimit);

      if (!rateLimitCheck.allowed) {
        console.warn(`[Worker Job ${job.id}] Rate limit exceeded for sender ${senderEmail} (${rateLimitCheck.currentCount}/${rateLimitCheck.maxLimit}).`);

        // Send deduplicated Slack notification
        const resumeIso = new Date(rateLimitCheck.resetTimeMs).toLocaleTimeString();
        await slackService.notifyRateLimitHit(
          userId,
          senderEmail,
          rateLimitCheck.currentCount,
          rateLimitCheck.maxLimit,
          resumeIso
        );

        // Reschedule job to next window
        const queue = getEmailQueue();
        await queue.add(
          'send-email',
          job.data,
          {
            jobId: `${scheduledEmailId}-delayed-${rateLimitCheck.resetTimeMs}`,
            delay: rateLimitCheck.delayMsUntilNextWindow,
          }
        );

        console.log(`[Worker Job ${job.id}] Rescheduled email ${scheduledEmailId} for next hour window (+${Math.round(rateLimitCheck.delayMsUntilNextWindow / 1000)}s).`);
        return;
      }

      // 3. Enforce inter-send delay to maintain healthy delivery pacing
      await rateLimiter.enforceMinDelay(senderKey);

      // 4. Update status to PROCESSING
      await emailRepository.updateStatus(scheduledEmailId, EmailStatus.PROCESSING, { incrementAttempt: true });

      // 5. Send via Ethereal SMTP transport
      const sendResult = await etherealTransport.sendEmail({
        to: recipient,
        subject,
        body,
        from: senderEmail.includes('@') ? senderEmail : undefined,
      });

      // 6. Record outcome and update search index
      if (sendResult.success) {
        await emailRepository.updateStatus(scheduledEmailId, EmailStatus.SENT, {
          sentAt: new Date(),
          messageId: sendResult.messageId,
          etherealPreviewUrl: sendResult.previewUrl,
        });

        await searchService.indexEmail({
          id: scheduledEmailId,
          userId,
          recipient,
          subject,
          status: EmailStatus.SENT,
          scheduledAt: emailRecord.scheduledAt.toISOString(),
          sentAt: new Date().toISOString(),
        });

        console.log(`[Worker Job ${job.id}] Successfully completed send for ${scheduledEmailId}.`);
      } else {
        const isLastAttempt = job.attemptsMade >= (job.opts.attempts || 3) - 1;
        await emailRepository.updateStatus(scheduledEmailId, isLastAttempt ? EmailStatus.FAILED : EmailStatus.PROCESSING, {
          errorMessage: sendResult.error,
        });

        await searchService.indexEmail({
          id: scheduledEmailId,
          userId,
          recipient,
          subject,
          status: isLastAttempt ? EmailStatus.FAILED : EmailStatus.PROCESSING,
          scheduledAt: emailRecord.scheduledAt.toISOString(),
          errorMessage: sendResult.error,
        });

        throw new Error(sendResult.error || 'Failed sending email via transport');
      }
    },
    {
      connection: redis,
      concurrency,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker Job ${job?.id}] Failed with error: ${err.message}`);
  });

  return worker;
}

// Standalone execution if started directly via npm run worker
if (process.argv[1]?.endsWith('email.worker.ts') || process.argv[1]?.endsWith('email.worker.js')) {
  console.log('[Worker Standalone] Initializing background email worker process...');
  startEmailWorker();
}
