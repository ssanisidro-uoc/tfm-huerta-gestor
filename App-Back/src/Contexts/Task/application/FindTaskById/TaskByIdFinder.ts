import { Task } from '../../domain/Task';
import { TaskRepository } from '../../domain/TaskRepository';

export class TaskByIdFinder {
  constructor(private repository: TaskRepository) {}

  async run(id: string): Promise<Task | null> {
    return this.repository.search_by_id(id);
  }
}
