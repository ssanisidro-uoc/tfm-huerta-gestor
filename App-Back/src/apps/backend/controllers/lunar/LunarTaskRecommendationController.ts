import { NextFunction, Request, Response } from 'express';
import { LunarTaskRecommendationService } from '../../../../Contexts/Lunar/application/LunarTaskRecommendationService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class LunarTaskRecommendationController {
  constructor(private service: LunarTaskRecommendationService) {}

  async getByTaskId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({ success: false, error: 'taskId is required' });
        return;
      }

      const recommendations = await this.service.getRecommendationsByTaskId(taskId);

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      logger.error(`Error getting recommendations: ${error.message}`, 'LunarTaskRecommendationController');
      next(error);
    }
  }

  async markAsShown(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recommendationId } = req.params;

      await this.service.markAsShown(recommendationId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error(`Error marking as shown: ${error.message}`, 'LunarTaskRecommendationController');
      next(error);
    }
  }

  async updateUserResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recommendationId } = req.params;
      const { userResponse, userNotes } = req.body;

      if (!userResponse) {
        res.status(400).json({ success: false, error: 'userResponse is required' });
        return;
      }

      const updated = await this.service.updateUserResponse(recommendationId, { userResponse, userNotes });

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      logger.error(`Error updating response: ${error.message}`, 'LunarTaskRecommendationController');
      next(error);
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({ success: false, error: 'taskId is required' });
        return;
      }

      const stats = await this.service.getStatisticsForTask(taskId);

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      logger.error(`Error getting statistics: ${error.message}`, 'LunarTaskRecommendationController');
      next(error);
    }
  }
}