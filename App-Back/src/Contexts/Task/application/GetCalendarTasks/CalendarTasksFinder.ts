import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';

export class CalendarTasksFinder {
  constructor(private repository: TaskRepository) {}

  async run(
    garden_id: string,
    start_date: Date,
    end_date: Date,
    filters?: { status?: string; task_type?: string }
  ): Promise<Task[]> {
    return this.repository.find_by_date_range(garden_id, start_date, end_date, filters);
  }
}
