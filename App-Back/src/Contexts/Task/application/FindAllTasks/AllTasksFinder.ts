import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';

export class AllTasksFinder {
  constructor(private repository: TaskRepository) {}

  async run(
    garden_id: string,
    page: number = 1,
    limit: number = 20,
    filters?: { status?: string; task_type?: string; assigned_to?: string }
  ): Promise<{ tasks: Task[]; total: number }> {
    const offset = (page - 1) * limit;
    const tasks = await this.repository.find_by_garden(garden_id, { page, limit, offset, filters });
    const total = await this.repository.count_by_garden(garden_id, filters);
    return { tasks, total };
  }
}
