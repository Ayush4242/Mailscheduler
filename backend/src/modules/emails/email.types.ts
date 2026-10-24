import { z } from 'zod';

export const scheduleEmailSchema = z.object({
  recipient: z.string().email('Invalid email address format'),
  subject: z.string().min(1, 'Subject is required').max(255),
  body: z.string().min(1, 'Body is required'),
  scheduledAt: z.string().datetime({ message: 'Must be a valid ISO datetime string' }).optional(),
  senderAccountId: z.string().uuid().optional(),
  hourlyLimit: z.number().int().positive().optional(),
});

export const scheduleCampaignSchema = z.object({
  title: z.string().min(1, 'Campaign title is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  recipients: z.array(z.string().email('Invalid email recipient')).min(1, 'At least one recipient is required'),
  scheduledAt: z.string().datetime().optional(),
  delayBetweenEmailsMs: z.number().int().min(0).default(2000),
  hourlyLimit: z.number().int().positive().optional(),
});

export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>;
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
