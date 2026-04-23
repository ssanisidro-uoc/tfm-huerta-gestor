import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';
import { logger } from '../../../Shared/infrastructure/Logger';

export class TaskCompleter {
  constructor(private repository: TaskRepository) {}

  async run(
    id: string,
    data: { completed_by: string; completion_notes?: string; actual_duration_minutes?: number }
  ): Promise<Task> {
    const task = await this.repository.search_by_id(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    logger.info(`Completing task ${id}, current status: ${task.status}`, 'TaskCompleter');
    
    const completedTask = task.complete(data.completed_by, data.completion_notes, data.actual_duration_minutes);
    logger.info(`Task ${id} new status: ${completedTask.status}`, 'TaskCompleter');
    
    await this.repository.update(completedTask);
    return completedTask;
  }
}
