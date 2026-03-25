import { TaskRepository } from '../../domain/TaskRepository';
import { Task } from '../../domain/Task';
import { logger } from '../../../Shared/infrastructure/Logger';

export class TaskCanceller {
  constructor(private taskRepository: TaskRepository) {}

  async run(id: string, data: { cancelled_by: string; cancellation_reason: string }): Promise<Task> {
    const task = await this.taskRepository.search_by_id(id);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status === 'completed') {
      throw new Error('Cannot cancel a completed task');
    }

    if (task.status === 'cancelled') {
      throw new Error('Task is already cancelled');
    }

    const cancelledTask = task.cancel(data.cancelled_by, data.cancellation_reason);
    await this.taskRepository.update(cancelledTask);

    logger.info(`Task ${id} cancelled by ${data.cancelled_by}`, 'TaskCanceller');

    return cancelledTask;
  }
}
