import { Request, Response } from 'express';
import { emailService } from '../emails/email.service.js';
import { scheduleCampaignSchema } from '../emails/email.types.js';
import { prisma } from '../../config/db.js';

export class CampaignController {
  /**
   * Bulk schedules a campaign with multiple recipients and send spacing
   */
  async schedule(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = scheduleCampaignSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const result = await emailService.scheduleCampaign(userId, validation.data);
    return res.status(201).json({ success: true, ...result });
  }

  /**
   * Lists campaigns created by the user
   */
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const campaigns = await prisma.emailCampaign.findMany({
      where: { userId },
      include: {
        _count: {
          select: { scheduledEmails: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ count: campaigns.length, campaigns });
  }
}

export const campaignController = new CampaignController();
