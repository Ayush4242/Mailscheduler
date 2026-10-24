import { v4 as uuidv4 } from 'uuid';
import { emailRepository } from './email.repository.js';
import { getEmailQueue } from '../../infrastructure/queue/email-queue.js';
import { searchService } from '../search/search.service.js';
import { prisma } from '../../config/db.js';
import { ScheduleEmailInput, ScheduleCampaignInput } from './email.types.js';

export class EmailService {
  /**
   * Schedules a single email recipient
   */
  async scheduleSingleEmail(userId: string, input: ScheduleEmailInput) {
    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : new Date();
    const idempotencyKey = `email-${uuidv4()}`;

    // 1. Save in PostgreSQL (authoritative)
    const emailRecord = await emailRepository.create({
      user: { connect: { id: userId } },
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      scheduledAt,
      idempotencyKey,
      senderAccount: input.senderAccountId
        ? { connect: { id: input.senderAccountId } }
        : undefined,
    });

    // 2. Enqueue into BullMQ with stable jobId for idempotency
    try {
      const queue = getEmailQueue();
      const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());

      await queue.add(
        'send-email',
        {
          scheduledEmailId: emailRecord.id,
          userId,
          recipient: emailRecord.recipient,
          subject: emailRecord.subject,
          body: emailRecord.body,
          senderAccountId: input.senderAccountId,
          hourlyLimit: input.hourlyLimit,
        },
        {
          jobId: emailRecord.id,
          delay: delayMs,
        }
      );
    } catch (err: any) {
      console.warn(`[Queue Warning] Enqueue failed for ${emailRecord.id}: ${err.message}. Email saved to DB and will be picked up by reconciliation.`);
    }

    // 3. Index to Elasticsearch
    await searchService.indexEmail({
      id: emailRecord.id,
      userId,
      recipient: emailRecord.recipient,
      subject: emailRecord.subject,
      status: emailRecord.status,
      scheduledAt: emailRecord.scheduledAt.toISOString(),
      sentAt: null,
    });

    return emailRecord;
  }

  /**
   * Schedules a campaign with multiple recipients and staggered send intervals
   */
  async scheduleCampaign(userId: string, input: ScheduleCampaignInput) {
    const baseScheduledAt = input.scheduledAt ? new Date(input.scheduledAt).getTime() : Date.now();
    const delayBetween = input.delayBetweenEmailsMs || 2000;

    // 1. Create EmailCampaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        userId,
        title: input.title,
        subject: input.subject,
        body: input.body,
        totalRecipients: input.recipients.length,
      },
    });

    const queue = getEmailQueue();
    const createdEmails = [];

    // 2. Schedule each recipient with calculated delay
    for (let i = 0; i < input.recipients.length; i++) {
      const recipient = input.recipients[i];
      const scheduledTime = new Date(baseScheduledAt + i * delayBetween);
      const idempotencyKey = `campaign-${campaign.id}-${i}-${uuidv4()}`;

      const emailRecord = await emailRepository.create({
        user: { connect: { id: userId } },
        campaign: { connect: { id: campaign.id } },
        recipient,
        subject: input.subject,
        body: input.body,
        scheduledAt: scheduledTime,
        idempotencyKey,
      });

      createdEmails.push(emailRecord);

      try {
        const delayMs = Math.max(0, scheduledTime.getTime() - Date.now());
        await queue.add(
          'send-email',
          {
            scheduledEmailId: emailRecord.id,
            userId,
            recipient: emailRecord.recipient,
            subject: emailRecord.subject,
            body: emailRecord.body,
            hourlyLimit: input.hourlyLimit,
          },
          {
            jobId: emailRecord.id,
            delay: delayMs,
          }
        );
      } catch (err: any) {
        console.warn(`[Queue Warning] Job enqueue failed for ${emailRecord.id}: ${err.message}`);
      }

      // Elasticsearch index
      await searchService.indexEmail({
        id: emailRecord.id,
        userId,
        recipient: emailRecord.recipient,
        subject: emailRecord.subject,
        status: emailRecord.status,
        scheduledAt: emailRecord.scheduledAt.toISOString(),
        campaignId: campaign.id,
      });
    }

    return {
      campaign,
      totalScheduled: createdEmails.length,
    };
  }

  /**
   * Recovers scheduled emails that should have been processed but weren't
   * (e.g. if the server restarted or Redis failed during transaction)
   */
  async reconcilePendingEmails() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingEmails = await emailRepository.findUnprocessedDueEmails(fiveMinutesAgo);

    if (pendingEmails.length === 0) return 0;

    console.log(`[Reconciliation] Found ${pendingEmails.length} unhandled due emails. Re-enqueuing...`);
    const queue = getEmailQueue();

    for (const email of pendingEmails) {
      await queue.add(
        'send-email',
        {
          scheduledEmailId: email.id,
          userId: email.userId,
          recipient: email.recipient,
          subject: email.subject,
          body: email.body,
          senderAccountId: email.senderAccountId || undefined,
        },
        {
          jobId: email.id,
          delay: 0, // Process immediately
        }
      );
    }

    return pendingEmails.length;
  }
}

export const emailService = new EmailService();
