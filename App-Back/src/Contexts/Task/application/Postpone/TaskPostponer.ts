import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';
import { AppError } from '../../../Shared/domain/AppError';

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

    const postponedTask = task.postpone(data.postponed_by, data.reason || '', data.postponed_until);
    await this.repository.update(postponedTask);
    return postponedTask;
  }
}
