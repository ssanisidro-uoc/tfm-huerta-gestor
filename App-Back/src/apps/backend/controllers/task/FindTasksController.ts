import { NextFunction, Request, Response } from 'express';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
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
      const { page = '1', limit = '20', status, task_type } = req.query;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const filters: any = {};
      if (status) filters.status = status;
      if (task_type) filters.task_type = task_type;

      // Si hay garden_id, verificar acceso
      if (garden_id) {
        const garden = await this.userGardenRepository.find_by_user_and_garden(
          user.userId,
          garden_id
        );
        if (!garden) {
          throw new AppError(403, 'GARDEN_ACCESS_DENIED', 'You do not have access to this garden');
        }

        const query = new FindAllTasksQuery(garden_id, pageNum, limitNum, filters);
        const result = (await this.queryBus.ask(query)) as FindAllTasksResponse;

        logger.info(
          `Found ${result.tasks.length} tasks for garden ${garden_id}`,
          'FindTasksController'
        );

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
      } else {
        // Obtener huertas del usuario
        const userGardens = await this.userGardenRepository.find_by_user(user.userId);

        if (userGardens.length === 0) {
          res.status(200).json({
            success: true,
            data: [],
            pagination: { page: 1, limit: limitNum, total: 0, total_pages: 0 }
          });
          return;
        }

        // Obtener tareas de todas las huertas del usuario
        const gardenIds = userGardens.map((ug) => ug.garden_id);

        const query = new FindAllTasksQuery(gardenIds, pageNum, limitNum, filters);
        const result = (await this.queryBus.ask(query)) as FindAllTasksResponse;

        logger.info(
          `Found ${result.tasks.length} tasks for user ${user.userId}`,
          'FindTasksController'
        );

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
      }
    } catch (error: any) {
      logger.error(`Error finding tasks: ${error.message}`, 'FindTasksController');
      next(error);
    }
  }
}
