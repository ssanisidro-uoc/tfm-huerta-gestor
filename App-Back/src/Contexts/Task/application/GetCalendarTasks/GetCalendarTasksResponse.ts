import { Response } from '../../../Shared/domain/Response';

export class GetCalendarTasksResponse implements Response {
  constructor(
    readonly tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      scheduled_date: Date;
      due_date: Date | null;
      status: string;
      task_type: string | null;
      task_category: string | null;
      garden_id: string;
      plot_id: string | null;
      planting_id: string | null;
      priority: string;
      is_recurring: boolean;
      postponed_until: Date | null;
      postponed_reason: string | null;
      postponed_by: string | null;
    }>
  ) {}
}
