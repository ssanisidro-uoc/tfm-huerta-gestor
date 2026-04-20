import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetTaskStatsQuery } from './GetTaskStatsQuery';
import { TaskStatsFinder, TaskStatsResponse } from './TaskStatsFinder';

export class GetTaskStatsQueryHandler implements QueryHandler<GetTaskStatsQuery, TaskStatsResponse> {
  constructor(private finder: TaskStatsFinder) {}

  subscribedTo(): Query {
    return GetTaskStatsQuery;
  }

  async handle(query: GetTaskStatsQuery): Promise<TaskStatsResponse> {
    return await this.finder.run(query.user_id);
  }
}