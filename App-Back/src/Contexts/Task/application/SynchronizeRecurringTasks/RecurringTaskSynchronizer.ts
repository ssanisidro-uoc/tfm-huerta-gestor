import { TaskRepository } from '../../domain/TaskRepository';
import { Task } from '../../domain/Task';
import { TaskId } from '../../domain/value-objects/TaskId';
import { TaskTitle } from '../../domain/value-objects/TaskTitle';
import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { logger } from '../../../Shared/infrastructure/Logger';

interface RecurrenceConfig {
  pattern: string;
  interval: number;
}

export class RecurringTaskSynchronizer {
  constructor(private taskRepository: TaskRepository) {}

  async synchronize(): Promise<number> {
    logger.info('Starting recurring tasks synchronization', 'RecurringTaskSynchronizer');

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringTasks = await this.taskRepository.find_recurring_pending();

    let createdCount = 0;

    for (const task of recurringTasks) {
      try {
        const nextOccurrence = this.calculateNextOccurrence(
          task.scheduled_date,
          task.recurrence_pattern,
          task.recurrence_interval
        );

        if (nextOccurrence <= sevenDaysFromNow) {
          const newTask = this.createNextOccurrence(task, nextOccurrence);
          await this.taskRepository.save(newTask);
          createdCount++;
          logger.debug(`Created next occurrence for task ${task.id.get_value()}`, 'RecurringTaskSynchronizer');
        }
      } catch (error) {
        logger.error(`Error synchronizing task ${task.id.get_value()}: ${(error as Error).message}`, 'RecurringTaskSynchronizer');
      }
    }

    logger.info(`Recurring tasks synchronization completed. Created ${createdCount} new occurrences`, 'RecurringTaskSynchronizer');
    return createdCount;
  }

  private calculateNextOccurrence(
    currentDate: Date,
    pattern: string | null,
    interval: number | null
  ): Date {
    if (!pattern || !interval) {
      return currentDate;
    }

    const next = new Date(currentDate);

    switch (pattern) {
      case 'daily':
        next.setDate(next.getDate() + interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 * interval));
        break;
      case 'biweekly':
        next.setDate(next.getDate() + (14 * interval));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        logger.warn(`Unknown recurrence pattern: ${pattern}`, 'RecurringTaskSynchronizer');
        return currentDate;
    }

    return next;
  }

  private createNextOccurrence(parentTask: Task, nextDate: Date): Task {
    return new Task({
      id: new TaskId(crypto.randomUUID()),
      garden_id: parentTask.garden_id,
      plot_id: parentTask.plot_id,
      planting_id: parentTask.planting_id,
      task_type: parentTask.task_type,
      task_category: parentTask.task_category,
      generated_by: 'system',
      template_id: parentTask.template_id,
      title: parentTask.title,
      description: parentTask.description,
      instructions: parentTask.instructions,
      scheduled_date: nextDate,
      due_date: parentTask.due_date,
      estimated_duration_minutes: parentTask.estimated_duration_minutes,
      is_recurring: parentTask.is_recurring,
      recurrence_pattern: parentTask.recurrence_pattern,
      recurrence_interval: parentTask.recurrence_interval,
      recurrence_end_date: parentTask.recurrence_end_date,
      parent_task_id: parentTask.id.get_value(),
      status: 'pending',
      priority: parentTask.priority,
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
  }
}
