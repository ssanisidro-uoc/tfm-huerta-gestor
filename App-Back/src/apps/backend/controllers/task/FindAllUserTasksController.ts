import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';
import { TaskRepository } from '../../../../Contexts/Task/domain/TaskRepository';

interface TaskQueryResult {
  id: string;
  title: string;
  description: string;
  garden_id: string;
  plot_id: string | null;
  task_type: string | null;
  task_category: string | null;
  status: string;
  scheduled_date: Date;
  due_date: Date | null;
  priority: string;
  created_at: Date;
}

interface TaskStatsResult {
  pendientes_hoy: number;
  completadas_semana: number;
  postponidas: number;
  total_mes: number;
}

export class FindAllUserTasksController {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { garden_id, status, task_type, page = '1', limit = '20' } = req.query;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const userGardens = await this.userGardenRepository.find_by_user(user.userId);
      const gardenIds = userGardens.map(ug => ug.garden_id);

      if (gardenIds.length === 0) {
        res.status(200).json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, total_pages: 0 }
        });
        return;
      }

      let tasks: TaskQueryResult[] = [];
      let total = 0;

      if (garden_id && gardenIds.includes(garden_id as string)) {
        const filters: any = {};
        if (status) filters.status = status;
        if (task_type) filters.task_type = task_type;
        
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;
        
        const rawTasks = await this.taskRepository.find_by_garden(garden_id as string, { page: pageNum, limit: limitNum, offset, filters });
        
        tasks = rawTasks.map(task => ({
          id: task.id.get_value(),
          title: task.title.get_value(),
          description: task.description,
          garden_id: task.garden_id.get_value(),
          plot_id: task.plot_id,
          task_type: task.task_type,
          task_category: task.task_category,
          status: task.status,
          scheduled_date: task.scheduled_date,
          due_date: task.due_date,
          priority: task.priority,
          created_at: task.created_at
        }));
        
        total = await this.taskRepository.count_by_garden(garden_id as string, filters);
      } else {
        tasks = await this.getAllTasksForUser(gardenIds, { status: status as string, task_type: task_type as string });
        total = tasks.length;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      
      const paginatedTasks = tasks.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      logger.info(`Found ${total} tasks for user ${user.userId}`, 'FindAllUserTasksController');

      res.status(200).json({
        success: true,
        data: paginatedTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          garden_id: task.garden_id,
          plot_id: task.plot_id,
          task_type: task.task_type,
          task_category: task.task_category,
          status: task.status,
          scheduled_date: task.scheduled_date,
          due_date: task.due_date,
          priority: task.priority
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      logger.error(`Error finding all tasks: ${error.message}`, 'FindAllUserTasksController');
      next(error);
    }
  }

  private async getAllTasksForUser(gardenIds: string[], filters?: { status?: string; task_type?: string }): Promise<TaskQueryResult[]> {
    const allTasks: TaskQueryResult[] = [];
    
    for (const gardenId of gardenIds) {
      try {
        const page = 1;
        const limit = 1000;
        const offset = 0;
        const filterOptions = { 
          page, 
          limit, 
          offset, 
          filters: { 
            status: filters?.status, 
            task_type: filters?.task_type 
          } 
        };
        const tasks = await this.taskRepository.find_by_garden(gardenId, filterOptions);
        
        for (const task of tasks) {
          allTasks.push({
            id: task.id.get_value(),
            title: task.title.get_value(),
            description: task.description,
            garden_id: task.garden_id.get_value(),
            plot_id: task.plot_id,
            task_type: task.task_type,
            task_category: task.task_category,
            status: task.status,
            scheduled_date: task.scheduled_date,
            due_date: task.due_date,
            priority: task.priority,
            created_at: task.created_at
          });
        }
      } catch (e) {
        logger.warn(`Could not fetch tasks for garden ${gardenId}`, 'FindAllUserTasksController');
      }
    }
    
    return allTasks;
  }
}

export class GetTaskStatsController {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private taskRepository: TaskRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const userGardens = await this.userGardenRepository.find_by_user(user.userId);
      const gardenIds = userGardens.map(ug => ug.garden_id);

      if (gardenIds.length === 0) {
        res.status(200).json({
          success: true,
          data: {
            pendientes_hoy: 0,
            completadas_semana: 0,
            postponidas: 0,
            total_mes: 0
          }
        });
        return;
      }

      const stats = await this.calculateStats(gardenIds);

      logger.info(`Task stats for user ${user.userId}`, 'GetTaskStatsController');

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error(`Error calculating task stats: ${error.message}`, 'GetTaskStatsController');
      next(error);
    }
  }

  private async calculateStats(gardenIds: string[]): Promise<TaskStatsResult> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    let pendientesHoy = 0;
    let completadasSemana = 0;
    let postponidas = 0;
    let totalMes = 0;

    for (const gardenId of gardenIds) {
      try {
        const page = 1;
        const limit = 1000;
        const offset = 0;
        const filterOptions = { page, limit, offset, filters: {} };
        const tasks = await this.taskRepository.find_by_garden(gardenId, filterOptions);

        for (const task of tasks) {
          const scheduledDate = new Date(task.scheduled_date);
          scheduledDate.setHours(0, 0, 0, 0);
          const scheduledDateTime = scheduledDate.getTime();
          const hoyTime = hoy.getTime();
          const inicioSemanaTime = inicioSemana.getTime();
          const inicioMesTime = inicioMes.getTime();

          if (task.status === 'pending') {
            if (scheduledDateTime === hoyTime) {
              pendientesHoy++;
            }
          }

          if (task.status === 'completed' && task.completed_at) {
            const completedDate = new Date(task.completed_at);
            if (completedDate >= inicioSemana) {
              completadasSemana++;
            }
          }

          if (task.status === 'postponed') {
            postponidas++;
          }

          if (scheduledDateTime >= inicioMesTime) {
            totalMes++;
          }
        }
      } catch (e) {
        logger.warn(`Could not calculate stats for garden ${gardenId}`, 'GetTaskStatsController');
      }
    }

    return {
      pendientes_hoy: pendientesHoy,
      completadas_semana: completadasSemana,
      postponidas: postponidas,
      total_mes: totalMes
    };
  }
}