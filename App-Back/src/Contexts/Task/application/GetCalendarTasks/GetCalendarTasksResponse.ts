import { Response } from '../../../Shared/domain/Response';

export class GetCalendarTasksResponse implements Response {
  constructor(
    readonly tasks: Array<{
      id: string;
      title: string;
      scheduled_date: Date;
      due_date: Date | null;
      status: string;
      task_type: string;
      garden_id: string;
    }>
  ) {}
}
