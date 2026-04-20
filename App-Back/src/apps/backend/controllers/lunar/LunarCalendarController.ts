import { NextFunction, Request, Response } from 'express';
import { LunarMonthlyCalendarService } from '../../../../Contexts/Lunar/application/LunarMonthlyCalendarService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class LunarCalendarController {
  constructor(private service: LunarMonthlyCalendarService) {}

  async getMonthly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const hemisphere = req.query.hemisphere as string || 'northern';

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ success: false, error: 'Invalid year or month' });
        return;
      }

      const calendar = await this.service.getOrCreateCalendar(year, month, hemisphere);

      res.status(200).json({
        success: true,
        data: calendar
      });
    } catch (error: any) {
      logger.error(`Error getting lunar calendar: ${error.message}`, 'LunarCalendarController');
      next(error);
    }
  }
}
