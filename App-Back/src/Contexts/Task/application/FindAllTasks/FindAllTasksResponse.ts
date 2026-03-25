import { Response } from '../../../Shared/domain/Response';

export class FindAllTasksResponse implements Response {
  constructor(
    readonly tasks: Array<{
      id: string;
      title: string;
      description: string;
      garden_id: string;
      status: string;
      task_type: string;
      scheduled_date: Date;
      due_date: Date | null;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
