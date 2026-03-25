import { Query } from '../../../Shared/domain/Query';

export class FindAllTasksQuery implements Query {
  constructor(
    readonly garden_id: string,
    readonly page: number = 1,
    readonly limit: number = 20,
    readonly filters?: {
      status?: string;
      task_type?: string;
      assigned_to?: string;
    }
  ) {}
}
