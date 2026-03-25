import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';

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

    task.complete(data.completed_by, data.completion_notes, data.actual_duration_minutes);
    await this.repository.update(task);
    return task;
  }
}
