import nodemailer, { Transporter } from 'nodemailer';
import { IEmailTransport, SendEmailOptions, SendEmailResult } from './email-transport.interface.js';
import { config } from '../../config/index.js';

export class EtherealEmailTransport implements IEmailTransport {
  private transporter: Transporter | null = null;
  private isInitializing = false;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (this.isInitializing) {
      // Small wait loop while another thread creates it
      await new Promise((resolve) => setTimeout(resolve, 300));
      return this.getTransporter();
    }

    this.isInitializing = true;
    try {
      let user = config.ethereal.user;
      let pass = config.ethereal.pass;

      if (!user || !pass) {
        console.log('[Ethereal] No fixed credentials configured, generating test account on the fly...');
        const testAccount = await nodemailer.createTestAccount();
        user = testAccount.user;
        pass = testAccount.pass;
        console.log(`[Ethereal] Dynamic test account created: ${user}`);
      }

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user, pass },
      });

      return this.transporter;
    } finally {
      this.isInitializing = false;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const transporter = await this.getTransporter();
      const defaultFrom = '"ReachInbox Demo" <noreply@reachinbox.test>';
      
      const info = await transporter.sendMail({
        from: options.from || defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: options.isHtml ? options.body : `<p>${options.body.replace(/\n/g, '<br/>')}</p>`,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[Ethereal] Email successfully sent to ${options.to}. MessageId: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[Ethereal Preview URL]: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (err: any) {
      console.error(`[Ethereal Error] Failed sending to ${options.to}:`, err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export const etherealTransport = new EtherealEmailTransport();
