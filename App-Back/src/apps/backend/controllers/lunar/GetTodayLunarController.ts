import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { LunarService } from '../../../../Contexts/Lunar/application/LunarService';

export class GetTodayLunarController {
  constructor(private lunarService: LunarService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hemisphere = (req.query.hemisphere as string) || 'northern';

      const result = await this.lunarService.getTodayLunar(hemisphere);

      logger.info(`Today lunar for hemisphere: ${hemisphere}`, 'GetTodayLunarController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error getting today lunar: ${error.message}`, 'GetTodayLunarController');
      next(error);
    }
  }
}