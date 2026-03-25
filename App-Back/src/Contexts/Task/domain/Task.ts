import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { TaskId } from './value-objects/TaskId';
import { TaskTitle } from './value-objects/TaskTitle';
import { GardenId } from '../../Garden/domain/value-objects/GardenId';
import { UserId } from '../../User/domain/UserId';

export class Task extends AggregateRoot {
  readonly id: TaskId;
  readonly garden_id: GardenId;
  readonly plot_id: string | null;
  readonly planting_id: string | null;
  readonly task_type: string;
  readonly task_category: string | null;
  readonly generated_by: string;
  readonly template_id: string | null;
  readonly title: TaskTitle;
  readonly description: string;
  readonly instructions: string | null;
  readonly scheduled_date: Date;
  readonly due_date: Date | null;
  readonly estimated_duration_minutes: number | null;
  readonly is_recurring: boolean;
  readonly recurrence_pattern: string | null;
  readonly recurrence_interval: number | null;
  readonly recurrence_end_date: Date | null;
  readonly parent_task_id: string | null;
  readonly status: string;
  readonly priority: string;
  readonly completed_at: Date | null;
  readonly completed_by: string | null;
  readonly actual_duration_minutes: number | null;
  readonly postponed_at: Date | null;
  readonly postponed_by: string | null;
  readonly postponed_reason: string | null;
  readonly postponed_until: Date | null;
  readonly cancelled_at: Date | null;
  readonly cancelled_by: string | null;
  readonly cancellation_reason: string | null;
  readonly reason: string | null;
  readonly related_moon_phase: string | null;
  readonly related_weather_event: string | null;
  readonly climate_triggered: boolean;
  readonly assigned_to: UserId | null;
  readonly assigned_at: Date | null;
  readonly completion_notes: string | null;
  readonly observations: string | null;
  readonly depends_on_task_ids: string[];
  readonly blocks_task_ids: string[];
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(data: {
    id: TaskId;
    garden_id: GardenId;
    plot_id?: string | null;
    planting_id?: string | null;
    task_type: string;
    task_category?: string | null;
    generated_by?: string;
    template_id?: string | null;
    title: TaskTitle;
    description?: string;
    instructions?: string | null;
    scheduled_date: Date;
    due_date?: Date | null;
    estimated_duration_minutes?: number | null;
    is_recurring?: boolean;
    recurrence_pattern?: string | null;
    recurrence_interval?: number | null;
    recurrence_end_date?: Date | null;
    parent_task_id?: string | null;
    status?: string;
    priority?: string;
    completed_at?: Date | null;
    completed_by?: string | null;
    actual_duration_minutes?: number | null;
    postponed_at?: Date | null;
    postponed_by?: string | null;
    postponed_reason?: string | null;
    postponed_until?: Date | null;
    cancelled_at?: Date | null;
    cancelled_by?: string | null;
    cancellation_reason?: string | null;
    reason?: string | null;
    related_moon_phase?: string | null;
    related_weather_event?: string | null;
    climate_triggered?: boolean;
    assigned_to?: UserId | null;
    assigned_at?: Date | null;
    completion_notes?: string | null;
    observations?: string | null;
    depends_on_task_ids?: string[];
    blocks_task_ids?: string[];
    created_at: Date;
    updated_at: Date;
  }) {
    super();
    this.id = data.id;
    this.garden_id = data.garden_id;
    this.plot_id = data.plot_id || null;
    this.planting_id = data.planting_id || null;
    this.task_type = data.task_type;
    this.task_category = data.task_category || null;
    this.generated_by = data.generated_by || 'system';
    this.template_id = data.template_id || null;
    this.title = data.title;
    this.description = data.description || '';
    this.instructions = data.instructions || null;
    this.scheduled_date = data.scheduled_date;
    this.due_date = data.due_date || null;
    this.estimated_duration_minutes = data.estimated_duration_minutes || null;
    this.is_recurring = data.is_recurring || false;
    this.recurrence_pattern = data.recurrence_pattern || null;
    this.recurrence_interval = data.recurrence_interval || null;
    this.recurrence_end_date = data.recurrence_end_date || null;
    this.parent_task_id = data.parent_task_id || null;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.completed_at = data.completed_at || null;
    this.completed_by = data.completed_by || null;
    this.actual_duration_minutes = data.actual_duration_minutes || null;
    this.postponed_at = data.postponed_at || null;
    this.postponed_by = data.postponed_by || null;
    this.postponed_reason = data.postponed_reason || null;
    this.postponed_until = data.postponed_until || null;
    this.cancelled_at = data.cancelled_at || null;
    this.cancelled_by = data.cancelled_by || null;
    this.cancellation_reason = data.cancellation_reason || null;
    this.reason = data.reason || null;
    this.related_moon_phase = data.related_moon_phase || null;
    this.related_weather_event = data.related_weather_event || null;
    this.climate_triggered = data.climate_triggered || false;
    this.assigned_to = data.assigned_to || null;
    this.assigned_at = data.assigned_at || null;
    this.completion_notes = data.completion_notes || null;
    this.observations = data.observations || null;
    this.depends_on_task_ids = data.depends_on_task_ids || [];
    this.blocks_task_ids = data.blocks_task_ids || [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static create(data: {
    id: TaskId;
    garden_id: GardenId;
    task_type: string;
    title: TaskTitle;
    scheduled_date: Date;
    plot_id?: string | null;
    planting_id?: string | null;
    description?: string;
    due_date?: Date;
    is_recurring?: boolean;
    recurrence_pattern?: string | null;
    assigned_to?: UserId | null;
  }): Task {
    const now = new Date();
    return new Task({
      id: data.id,
      garden_id: data.garden_id,
      plot_id: data.plot_id || null,
      planting_id: data.planting_id || null,
      task_type: data.task_type,
      title: data.title,
      scheduled_date: data.scheduled_date,
      due_date: data.due_date || null,
      description: data.description || '',
      is_recurring: data.is_recurring || false,
      recurrence_pattern: data.recurrence_pattern || null,
      assigned_to: data.assigned_to || null,
      created_at: now,
      updated_at: now
    });
  }

  static from_persistence(raw: any): Task {
    return new Task({
      id: new TaskId(raw.id),
      garden_id: new GardenId(raw.garden_id),
      plot_id: raw.plot_id,
      planting_id: raw.planting_id,
      task_type: raw.task_type,
      task_category: raw.task_category,
      generated_by: raw.generated_by,
      template_id: raw.template_id,
      title: new TaskTitle(raw.title),
      description: raw.description,
      instructions: raw.instructions,
      scheduled_date: new Date(raw.scheduled_date),
      due_date: raw.due_date ? new Date(raw.due_date) : null,
      estimated_duration_minutes: raw.estimated_duration_minutes,
      is_recurring: raw.is_recurring,
      recurrence_pattern: raw.recurrence_pattern,
      recurrence_interval: raw.recurrence_interval,
      recurrence_end_date: raw.recurrence_end_date ? new Date(raw.recurrence_end_date) : null,
      parent_task_id: raw.parent_task_id,
      status: raw.status,
      priority: raw.priority,
      completed_at: raw.completed_at ? new Date(raw.completed_at) : null,
      completed_by: raw.completed_by,
      actual_duration_minutes: raw.actual_duration_minutes,
      postponed_at: raw.postponed_at ? new Date(raw.postponed_at) : null,
      postponed_by: raw.postponed_by,
      postponed_reason: raw.postponed_reason,
      postponed_until: raw.postponed_until ? new Date(raw.postponed_until) : null,
      cancelled_at: raw.cancelled_at ? new Date(raw.cancelled_at) : null,
      cancelled_by: raw.cancelled_by,
      cancellation_reason: raw.cancellation_reason,
      reason: raw.reason,
      related_moon_phase: raw.related_moon_phase,
      related_weather_event: raw.related_weather_event,
      climate_triggered: raw.climate_triggered,
      assigned_to: raw.assigned_to ? new UserId(raw.assigned_to) : null,
      assigned_at: raw.assigned_at ? new Date(raw.assigned_at) : null,
      completion_notes: raw.completion_notes,
      observations: raw.observations,
      depends_on_task_ids: raw.depends_on_task_ids || [],
      blocks_task_ids: raw.blocks_task_ids || [],
      created_at: new Date(raw.created_at),
      updated_at: new Date(raw.updated_at)
    });
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      garden_id: this.garden_id.get_value(),
      plot_id: this.plot_id,
      planting_id: this.planting_id,
      task_type: this.task_type,
      task_category: this.task_category,
      generated_by: this.generated_by,
      template_id: this.template_id,
      title: this.title.get_value(),
      description: this.description,
      instructions: this.instructions,
      scheduled_date: this.scheduled_date,
      due_date: this.due_date,
      estimated_duration_minutes: this.estimated_duration_minutes,
      is_recurring: this.is_recurring,
      recurrence_pattern: this.recurrence_pattern,
      recurrence_interval: this.recurrence_interval,
      recurrence_end_date: this.recurrence_end_date,
      parent_task_id: this.parent_task_id,
      status: this.status,
      priority: this.priority,
      completed_at: this.completed_at,
      completed_by: this.completed_by,
      actual_duration_minutes: this.actual_duration_minutes,
      postponed_at: this.postponed_at,
      postponed_by: this.postponed_by,
      postponed_reason: this.postponed_reason,
      postponed_until: this.postponed_until,
      cancelled_at: this.cancelled_at,
      cancelled_by: this.cancelled_by,
      cancellation_reason: this.cancellation_reason,
      reason: this.reason,
      related_moon_phase: this.related_moon_phase,
      related_weather_event: this.related_weather_event,
      climate_triggered: this.climate_triggered,
      assigned_to: this.assigned_to ? this.assigned_to.get_value() : null,
      assigned_at: this.assigned_at,
      completion_notes: this.completion_notes,
      observations: this.observations,
      depends_on_task_ids: this.depends_on_task_ids,
      blocks_task_ids: this.blocks_task_ids,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  complete(completed_by: string, completion_notes?: string, actual_duration_minutes?: number): Task {
    return new Task({
      ...this,
      completed_at: new Date(),
      completed_by,
      status: 'completed',
      completion_notes: completion_notes || null,
      actual_duration_minutes: actual_duration_minutes || null,
      updated_at: new Date()
    });
  }

  cancel(cancelled_by: string, cancellation_reason: string): Task {
    return new Task({
      ...this,
      cancelled_at: new Date(),
      cancelled_by,
      cancellation_reason,
      status: 'cancelled',
      updated_at: new Date()
    });
  }

  postpone(postponed_by: string, reason: string, until: Date): Task {
    return new Task({
      ...this,
      postponed_at: new Date(),
      postponed_by,
      postponed_reason: reason,
      postponed_until: until,
      status: 'postponed',
      updated_at: new Date()
    });
  }

  assign(assigned_to: string, assigned_by: string): Task {
    return new Task({
      ...this,
      assigned_to: assigned_to as any,
      assigned_at: new Date(),
      updated_at: new Date()
    });
  }
}
