import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';
import { FindAllTasksQuery } from '../../../../Contexts/Task/application/FindAllTasks/FindAllTasksQuery';
import { FindAllTasksResponse } from '../../../../Contexts/Task/application/FindAllTasks/FindAllTasksResponse';

export class FindTasksController {
  constructor(
    private queryBus: QueryBus,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { garden_id } = req.params;
      const { 
        page = '1', 
        limit = '20', 
        status, 
        task_type
      } = req.query;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!garden_id) {
        throw new AppError(400, 'VALIDATION_ERROR', 'garden_id is required');
      }

      const hasAccess = await this.userGardenRepository.has_permission(user.userId, garden_id, 'viewer');
      if (!hasAccess) {
        const garden = await this.userGardenRepository.find_by_user_and_garden(user.userId, garden_id);
        if (!garden) {
          throw new AppError(403, 'GARDEN_ACCESS_DENIED', 'You do not have access to this garden');
        }
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const filters: any = {};
      if (status) filters.status = status;
      if (task_type) filters.task_type = task_type;

      const query = new FindAllTasksQuery(garden_id, pageNum, limitNum, filters);
      const result = await this.queryBus.ask(query) as FindAllTasksResponse;

      logger.info(`Found ${result.tasks.length} tasks for garden ${garden_id}`, 'FindTasksController');

      res.status(200).json({
        success: true,
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          total_pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: any) {
      logger.error(`Error finding tasks: ${error.message}`, 'FindTasksController');
      next(error);
    }
  }
}
