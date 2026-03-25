import { Task } from './Task';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  save_many(tasks: Task[]): Promise<void>;
  search_by_id(id: string): Promise<Task | null>;
  search_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number; filters?: { status?: string; task_type?: string; assigned_to?: string } }
  ): Promise<Task[]>;
  find_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number; filters?: { status?: string; task_type?: string; assigned_to?: string } }
  ): Promise<Task[]>;
  count_by_garden(garden_id: string, filters?: { status?: string; task_type?: string; assigned_to?: string }): Promise<number>;
  find_by_date_range(garden_id: string, start_date: Date, end_date: Date, filters?: { status?: string; task_type?: string }): Promise<Task[]>;
  find_recurring_pending(): Promise<Task[]>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
