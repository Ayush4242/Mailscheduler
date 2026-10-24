export interface SendEmailOptions {
  to: string;
  from?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export interface IEmailTransport {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
