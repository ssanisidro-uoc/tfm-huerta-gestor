import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardRecentActivityQuery } from './GetDashboardRecentActivityQuery';
import { DashboardRecentActivityResponse } from './DashboardRecentActivityFinder';
import { DashboardRecentActivityFinder } from './DashboardRecentActivityFinder';

export class GetDashboardRecentActivityQueryHandler implements QueryHandler<GetDashboardRecentActivityQuery, DashboardRecentActivityResponse> {
  constructor(private finder: DashboardRecentActivityFinder) {}

  subscribedTo(): Query {
    return GetDashboardRecentActivityQuery;
  }

  async handle(query: GetDashboardRecentActivityQuery): Promise<DashboardRecentActivityResponse> {
    return this.finder.run(query.userId);
  }
}
