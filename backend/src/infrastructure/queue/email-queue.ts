import { Queue } from 'bullmq';
import { config } from '../../config/index.js';

export const EMAIL_QUEUE_NAME = 'email-dispatch-queue';

export interface EmailJobData {
  scheduledEmailId: string;
  userId: string;
  recipient: string;
  subject: string;
  body: string;
  senderAccountId?: string;
  hourlyLimit?: number;
}

let emailQueueInstance: Queue<EmailJobData> | null = null;

export function getEmailQueue(): Queue<EmailJobData> {
  if (!emailQueueInstance) {
    emailQueueInstance = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5s, 10s, 20s
        },
        removeOnComplete: 1000,
        removeOnFail: 2000,
      },
    });

    emailQueueInstance.on('error', (err) => {
      console.warn(`[BullMQ Queue Warning]: ${err.message}`);
    });
  }
  return emailQueueInstance;
}
