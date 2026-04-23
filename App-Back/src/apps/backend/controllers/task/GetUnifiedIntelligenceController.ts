import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetTaskIntelligenceQuery } from '../../../../Contexts/Task/application/GetTaskIntelligence/GetTaskIntelligenceQuery';
import { GetTaskIntelligenceResponse } from '../../../../Contexts/Task/application/GetTaskIntelligence/GetTaskIntelligenceResponse';
import { GetGardenIntelligenceQuery } from '../../../../Contexts/Task/application/GetGardenIntelligence/GetGardenIntelligenceQuery';
import { GetGardenIntelligenceResponse } from '../../../../Contexts/Task/application/GetGardenIntelligence/GetGardenIntelligenceResponse';

export class GetUnifiedIntelligenceController {
  constructor(private queryBus: QueryBus) {}

  async getByTaskId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        res.status(400).json({ success: false, error: 'taskId is required' });
        return;
      }

      const query = new GetTaskIntelligenceQuery(taskId);
      const result = await this.queryBus.ask(query) as GetTaskIntelligenceResponse;

      res.status(200).json({
        success: true,
        data: result.intelligence
      });
    } catch (error: any) {
      res.status(404).json({ success: false, error: 'Task not found' });
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

      const query = new GetGardenIntelligenceQuery(gardenId, daysAhead);
      const result = await this.queryBus.ask(query) as GetGardenIntelligenceResponse;

      res.status(200).json({
        success: true,
        data: result.intelligences
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Error getting intelligence' });
      next(error);
    }
  }
}