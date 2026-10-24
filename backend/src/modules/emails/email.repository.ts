import { prisma } from '../../config/db.js';
import { EmailStatus, Prisma } from '@prisma/client';

export class EmailRepository {
  async create(data: Prisma.ScheduledEmailCreateInput) {
    return prisma.scheduledEmail.create({
      data,
    });
  }

  async createMany(data: Prisma.ScheduledEmailCreateManyInput[]) {
    return prisma.scheduledEmail.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(id: string) {
    return prisma.scheduledEmail.findUnique({
      where: { id },
      include: { senderAccount: true, user: true },
    });
  }

  async findByIdAndUser(id: string, userId: string) {
    return prisma.scheduledEmail.findFirst({
      where: { id, userId },
    });
  }

  async updateStatus(
    id: string,
    status: EmailStatus,
    extra: {
      sentAt?: Date;
      errorMessage?: string;
      messageId?: string;
      etherealPreviewUrl?: string;
      incrementAttempt?: boolean;
    } = {}
  ) {
    return prisma.scheduledEmail.update({
      where: { id },
      data: {
        status,
        sentAt: extra.sentAt,
        errorMessage: extra.errorMessage,
        messageId: extra.messageId,
        etherealPreviewUrl: extra.etherealPreviewUrl,
        attemptCount: extra.incrementAttempt ? { increment: 1 } : undefined,
      },
    });
  }

  async getScheduledByUserId(userId: string) {
    return prisma.scheduledEmail.findMany({
      where: {
        userId,
        status: { in: [EmailStatus.SCHEDULED, EmailStatus.PROCESSING] },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getSentByUserId(userId: string) {
    return prisma.scheduledEmail.findMany({
      where: {
        userId,
        status: { in: [EmailStatus.SENT, EmailStatus.FAILED] },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Reconciliation mechanism:
   * Finds emails stuck in 'SCHEDULED' past their scheduledAt by more than X minutes
   * to ensure no email is dropped if a Redis/Queue restart occurred before job execution.
   */
  async findUnprocessedDueEmails(cutoffDate: Date) {
    return prisma.scheduledEmail.findMany({
      where: {
        status: EmailStatus.SCHEDULED,
        scheduledAt: { lte: cutoffDate },
      },
      take: 100,
    });
  }
}

export const emailRepository = new EmailRepository();
