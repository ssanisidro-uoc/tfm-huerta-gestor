import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardTodayTasksQuery } from './GetDashboardTodayTasksQuery';
import { DashboardTodayTasksResponse } from './DashboardTodayTasksResponse';
import { DashboardTodayTasksFinder } from './DashboardTodayTasksFinder';

export class GetDashboardTodayTasksQueryHandler implements QueryHandler<GetDashboardTodayTasksQuery, DashboardTodayTasksResponse> {
  constructor(private finder: DashboardTodayTasksFinder) {}

  subscribedTo(): Query {
    return GetDashboardTodayTasksQuery;
  }

  async handle(query: GetDashboardTodayTasksQuery): Promise<DashboardTodayTasksResponse> {
    return await this.finder.run(query.userId);
  }
}