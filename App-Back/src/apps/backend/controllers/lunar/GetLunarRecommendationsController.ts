import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { LunarService } from '../../../../Contexts/Lunar/application/LunarService';

export class GetLunarRecommendationsController {
  constructor(private lunarService: LunarService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId, taskType } = req.params;
      const hemisphere = (req.query.hemisphere as string) || 'northern';

      if (!taskType) {
        res.status(400).json({
          success: false,
          error: 'taskType is required'
        });
        return;
      }

      const recommendations = await this.lunarService.getRecommendationsForTask(
        taskId || '',
        taskType,
        hemisphere
      );

      logger.info(`Lunar recommendations for task type: ${taskType}`, 'GetLunarRecommendationsController');

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      logger.error(`Error getting lunar recommendations: ${error.message}`, 'GetLunarRecommendationsController');
      next(error);
    }
  }
}