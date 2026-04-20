import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardAlertsQuery } from './GetDashboardAlertsQuery';
import { DashboardAlertsResponse } from './DashboardAlertsResponse';
import { DashboardAlertsFinder } from './DashboardAlertsFinder';

export class GetDashboardAlertsQueryHandler implements QueryHandler<GetDashboardAlertsQuery, DashboardAlertsResponse> {
  constructor(private finder: DashboardAlertsFinder) {}

  subscribedTo(): Query {
    return GetDashboardAlertsQuery;
  }

  async handle(query: GetDashboardAlertsQuery): Promise<DashboardAlertsResponse> {
    return await this.finder.run(query.userId);
  }
}