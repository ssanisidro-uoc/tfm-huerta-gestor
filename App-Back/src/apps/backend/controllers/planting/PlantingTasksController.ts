import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { TasksByPlantingQuery } from '../../../../Contexts/Task/application/TasksByPlanting/TasksByPlantingQuery';
import { TasksByPlantingResponse } from '../../../../Contexts/Task/application/TasksByPlanting/TasksByPlantingResponse';

export class PlantingTasksController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { planting_id } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!planting_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Planting ID is required');
      }

      const query = new TasksByPlantingQuery(planting_id, user.userId);
      const result = await this.queryBus.ask(query) as TasksByPlantingResponse;

      logger.info(`Found ${result.tasks.length} tasks for planting ${planting_id}`, 'PlantingTasksController');

      res.status(200).json({
        success: true,
        tasks: result.tasks
      });
    } catch (error: any) {
      logger.error(`Error fetching tasks for planting: ${error.message}`, 'PlantingTasksController');
      next(error);
    }
  }
}