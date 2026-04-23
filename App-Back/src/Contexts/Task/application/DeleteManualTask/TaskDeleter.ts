import { TaskRepository } from '../../domain/TaskRepository';
import { AppError } from '../../../Shared/domain/AppError';
import { TaskByIdFinder } from '../FindTaskById/TaskByIdFinder';

export class TaskDeleter {
  constructor(
    private repository: TaskRepository,
    private finder: TaskByIdFinder
  ) {}

  async run(taskId: string): Promise<void> {
    const task = await this.finder.run(taskId);
    
    if (!task) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found');
    }

    if (task.is_recurring) {
      throw new AppError(400, 'CANNOT_DELETE_RECURRING_TASK', 'Cannot delete recurring tasks manually');
    }

    await this.repository.delete(taskId);
  }
}