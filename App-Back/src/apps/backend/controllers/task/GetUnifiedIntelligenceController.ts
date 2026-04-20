import { NextFunction, Request, Response } from 'express';
import { UnifiedIntelligenceService } from '../../../../Contexts/Task/application/UnifiedIntelligence/UnifiedIntelligenceService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetUnifiedIntelligenceController {
  constructor(private service: UnifiedIntelligenceService) {}

  async getByTaskId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({ success: false, error: 'taskId is required' });
        return;
      }

      const intelligence = await this.service.getIntelligenceForTask(taskId);

      if (!intelligence) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: intelligence
      });
    } catch (error: any) {
      logger.error(`Error getting unified intelligence: ${error.message}`, 'GetUnifiedIntelligenceController');
      next(error);
    }
  }

  async getByGarden(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gardenId } = req.params;
      const daysAhead = parseInt(req.query.days as string) || 7;

      if (!gardenId) {
        res.status(400).json({ success: false, error: 'gardenId is required' });
        return;
      }

      const intelligences = await this.service.getIntelligenceForGarden(gardenId, daysAhead);

      res.status(200).json({
        success: true,
        data: intelligences
      });
    } catch (error: any) {
      logger.error(`Error getting garden intelligence: ${error.message}`, 'GetUnifiedIntelligenceController');
      next(error);
    }
  }
}
