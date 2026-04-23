import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';
import { AppError } from '../../../Shared/domain/AppError';
import { logger } from '../../../Shared/infrastructure/Logger';

export class TaskPostponer {
  constructor(private repository: TaskRepository) {}

  async run(
    taskId: string,
    data: {
      postponed_by: string;
      reason?: string;
      postponed_until: Date;
    }
  ): Promise<Task> {
    const task = await this.repository.search_by_id(taskId);
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    if (task.status === 'completed') {
      throw new AppError(400, 'TASK_ALREADY_COMPLETED', 'Cannot postpone a completed task');
    }

    if (task.status === 'cancelled') {
      throw new AppError(400, 'TASK_CANCELLED', 'Cannot postpone a cancelled task');
    }

    const scheduledDate = new Date(task.scheduled_date);
    let postponeDate = new Date(data.postponed_until);
    
    if (postponeDate <= scheduledDate) {
      postponeDate = new Date(scheduledDate);
      postponeDate.setDate(postponeDate.getDate() + 1);
      postponeDate.setHours(23, 59, 59, 999);
    }
    
    logger.info(`Postpone - scheduled_date: ${scheduledDate.toISOString()}, new postpone_until: ${postponeDate.toISOString()}`, 'TaskPostponer');

    const postponedTask = task.postpone(data.postponed_by, data.reason || 'Tarea retrasada', postponeDate);
    await this.repository.update(postponedTask);
    return postponedTask;
  }
}
