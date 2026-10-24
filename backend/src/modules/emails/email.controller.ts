import { Request, Response } from 'express';
import { emailService } from './email.service.js';
import { emailRepository } from './email.repository.js';
import { scheduleEmailSchema } from './email.types.js';
import { searchService } from '../search/search.service.js';

export class EmailController {
  /**
   * Schedules a single email
   */
  async scheduleSingle(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = scheduleEmailSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const email = await emailService.scheduleSingleEmail(userId, validation.data);
    return res.status(201).json({ success: true, email });
  }

  /**
   * Returns scheduled emails for the logged-in user
   */
  async getScheduled(req: Request, res: Response) {
    const userId = req.user!.id;
    const scheduledEmails = await emailRepository.getScheduledByUserId(userId);
    return res.json({ count: scheduledEmails.length, emails: scheduledEmails });
  }

  /**
   * Returns sent and failed emails for the logged-in user
   */
  async getSent(req: Request, res: Response) {
    const userId = req.user!.id;
    const sentEmails = await emailRepository.getSentByUserId(userId);
    return res.json({ count: sentEmails.length, emails: sentEmails });
  }

  /**
   * Searches emails via Elasticsearch with user isolation
   */
  async search(req: Request, res: Response) {
    const userId = req.user!.id;
    const query = req.query.q as string | undefined;
    const status = req.query.status as string | undefined;

    // First try Elasticsearch
    let results = await searchService.searchEmails(userId, query, status);

    // If Elasticsearch is empty or unavailable, fall back to PostgreSQL database search
    if (results.length === 0) {
      const dbEmails = await emailRepository.getScheduledByUserId(userId);
      const sentEmails = await emailRepository.getSentByUserId(userId);
      const all = [...dbEmails, ...sentEmails];

      results = all.filter((e) => {
        const matchesStatus = !status || e.status === status;
        const matchesQuery =
          !query ||
          e.recipient.toLowerCase().includes(query.toLowerCase()) ||
          e.subject.toLowerCase().includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
      });
    }

    return res.json({ count: results.length, emails: results });
  }
}

export const emailController = new EmailController();
