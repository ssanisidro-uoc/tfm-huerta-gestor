import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { TaskStatsQuery } from './TaskStatsQuery';
import { TaskStatsFinder, TaskStatsResponse } from './TaskStatsFinder';

export class TaskStatsQueryHandler implements QueryHandler<TaskStatsQuery, TaskStatsResponse> {
  constructor(private finder: TaskStatsFinder) {}

  subscribedTo(): Query {
    return TaskStatsQuery;
  }

  async handle(query: TaskStatsQuery): Promise<TaskStatsResponse> {
    return await this.finder.run(query.userId);
  }
}
