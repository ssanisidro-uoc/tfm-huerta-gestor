import { TaskRepository } from '../../domain/TaskRepository';
import { Task } from '../../domain/Task';
import { logger } from '../../../Shared/infrastructure/Logger';

export class TaskAssigner {
  constructor(private taskRepository: TaskRepository) {}

  async run(id: string, data: { assigned_to: string; assigned_by: string }): Promise<Task> {
    const task = await this.taskRepository.search_by_id(id);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === 'completed') {
      throw new Error('Cannot assign a completed task');
    }

    if (task.status === 'cancelled') {
      throw new Error('Cannot assign a cancelled task');
    }

    const assignedTask = task.assign(data.assigned_to, data.assigned_by);
    await this.taskRepository.update(assignedTask);

    logger.info(`Task ${id} assigned to ${data.assigned_to} by ${data.assigned_by}`, 'TaskAssigner');

    return assignedTask;
  }
}
