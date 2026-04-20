import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { GetTasksByPlantingQuery } from '../../../../Contexts/Planting/application/TasksByPlanting/GetTasksByPlantingQuery';
import { TasksByPlantingResponse } from '../../../../Contexts/Planting/application/TasksByPlanting/TasksByPlantingResponse';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetTasksByPlantingController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planting_id } = req.params;
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!planting_id) {
        throw new AppError(400, 'MISSING_PLANTING', 'planting_id is required');
      }

      const query = new GetTasksByPlantingQuery(planting_id, user.userId);
      const result = await this.queryBus.ask(query) as TasksByPlantingResponse;

      logger.debug(`Fetched ${result.tasks.length} tasks for planting ${planting_id}`, 'GetTasksByPlantingController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error fetching tasks by planting: ${error.message}`, 'GetTasksByPlantingController');
      next(error);
    }
  }
}