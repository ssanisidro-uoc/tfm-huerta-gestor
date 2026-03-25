import { Task } from '../../domain/Task';
import { TaskId } from '../../domain/value-objects/TaskId';
import { TaskTitle } from '../../domain/value-objects/TaskTitle';
import { TaskRepository } from '../../domain/TaskRepository';
import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { UserId } from '../../../User/domain/UserId';

export class TaskCreator {
  constructor(private repository: TaskRepository) {}

  async run(
    id: string,
    title: string,
    description: string,
    garden_id: string,
    task_type: string,
    scheduled_date: Date,
    assigned_to: string | null,
    due_date?: Date,
    is_recurring: boolean = false,
    recurrence_pattern: string | null = null
  ): Promise<Task> {
    const task = Task.create({
      id: new TaskId(id),
      garden_id: new GardenId(garden_id),
      task_type,
      title: new TaskTitle(title),
      scheduled_date,
      description,
      due_date,
      is_recurring,
      recurrence_pattern,
      assigned_to: assigned_to ? new UserId(assigned_to) : null
    });

    await this.repository.save(task);
    return task;
  }
}
