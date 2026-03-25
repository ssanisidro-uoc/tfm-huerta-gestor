import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { TaskRepository } from '../../../../Contexts/Task/domain/TaskRepository';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';

export class FindTasksController {
  constructor(
    private taskRepository: TaskRepository,
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
        task_type,
        start_date,
        end_date
      } = req.query;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!garden_id) {
        throw new AppError(400, 'INVALID_REQUEST', 'garden_id is required');
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
      const offset = (pageNum - 1) * limitNum;

      const filters: any = {};
      if (status) filters.status = status;
      if (task_type) filters.task_type = task_type;

      let tasks: any[];
      
      if (start_date && end_date) {
        tasks = await this.taskRepository.find_by_date_range(
          garden_id,
          new Date(start_date as string),
          new Date(end_date as string),
          filters
        );
      } else {
        tasks = await this.taskRepository.find_by_garden(garden_id, {
          page: pageNum,
          limit: limitNum,
          offset,
          filters
        });
      }

      const total = await this.taskRepository.count_by_garden(garden_id, filters);

      logger.info(`Found ${tasks.length} tasks for garden ${garden_id}`, 'FindTasksController');

      res.status(200).json({
        success: true,
        data: tasks.map(task => ({
          id: task.id.get_value(),
          task_type: task.task_type,
          task_category: task.task_category,
          title: task.title.get_value(),
          description: task.description,
          scheduled_date: task.scheduled_date,
          due_date: task.due_date,
          plot_id: task.plot_id,
          planting_id: task.planting_id,
          status: task.status,
          priority: task.priority,
          is_recurring: task.is_recurring,
          recurrence_pattern: task.recurrence_pattern,
          parent_task_id: task.parent_task_id,
          completed_at: task.completed_at,
          completed_by: task.completed_by,
          postponed_until: task.postponed_until,
          assigned_to: task.assigned_to,
          created_at: task.created_at
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      logger.error(`Error finding tasks: ${error.message}`, 'FindTasksController');
      next(error);
    }
  }
}
