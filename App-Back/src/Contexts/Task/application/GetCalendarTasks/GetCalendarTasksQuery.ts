import { Query } from '../../../Shared/domain/Query';

export class GetCalendarTasksQuery implements Query {
  constructor(
    readonly garden_id: string,
    readonly start_date: Date,
    readonly end_date: Date,
    readonly filters?: {
      status?: string;
      task_type?: string;
    }
  ) {}
}
