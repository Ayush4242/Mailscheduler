export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  googleId?: string;
  slackIntegration?: {
    teamName?: string;
    channelName?: string;
    createdAt: string;
  };
}

export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';

export interface ScheduledEmail {
  id: string;
  userId: string;
  campaignId?: string;
  senderAccountId?: string;
  recipient: string;
  subject: string;
  body: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt?: string | null;
  attemptCount: number;
  errorMessage?: string | null;
  etherealPreviewUrl?: string | null;
  messageId?: string | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  title: string;
  subject: string;
  body: string;
  totalRecipients: number;
  createdAt: string;
  _count?: {
    scheduledEmails: number;
  };
}

export interface SlackStatus {
  connected: boolean;
  integration?: {
    id: string;
    teamName?: string;
    channelName?: string;
    createdAt: string;
  };
}
