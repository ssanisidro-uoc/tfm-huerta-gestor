import { TaskRepository } from '../../domain/TaskRepository';
import { Task } from '../../domain/Task';
import { TaskId } from '../../domain/value-objects/TaskId';
import { TaskTitle } from '../../domain/value-objects/TaskTitle';
import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { logger } from '../../../Shared/infrastructure/Logger';

export class ManualTaskCreator {
  constructor(private taskRepository: TaskRepository) {}

  async run(data: {
    id: string;
    garden_id: string;
    plot_id: string | null;
    planting_id: string | null;
    task_type: string;
    task_category: string | null;
    title: string;
    description: string | null;
    scheduled_date: Date;
    due_date: Date | null;
    estimated_duration_minutes: number | null;
    priority: string;
    created_by: string;
  }): Promise<Task> {
    const task = new Task({
      id: new TaskId(data.id),
      garden_id: new GardenId(data.garden_id),
      plot_id: data.plot_id,
      planting_id: data.planting_id,
      task_type: data.task_type,
      task_category: data.task_category,
      generated_by: 'manual',
      template_id: null,
      title: new TaskTitle(data.title),
      description: data.description || undefined,
      instructions: null,
      scheduled_date: data.scheduled_date,
      due_date: data.due_date,
      estimated_duration_minutes: data.estimated_duration_minutes,
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_interval: null,
      recurrence_end_date: null,
      parent_task_id: null,
      status: 'pending',
      priority: data.priority,
      completed_at: null,
      completed_by: null,
      actual_duration_minutes: null,
      postponed_at: null,
      postponed_by: null,
      postponed_reason: null,
      postponed_until: null,
      cancelled_at: null,
      cancelled_by: null,
      cancellation_reason: null,
      reason: null,
      related_moon_phase: null,
      related_weather_event: null,
      climate_triggered: false,
      assigned_to: null,
      assigned_at: null,
      completion_notes: null,
      observations: null,
      depends_on_task_ids: [],
      blocks_task_ids: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    await this.taskRepository.save(task);

    logger.info(`Manual task ${data.id} created by ${data.created_by}`, 'ManualTaskCreator');

    return task;
  }
}
