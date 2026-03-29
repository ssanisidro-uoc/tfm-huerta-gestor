import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardCropsSummaryQuery } from './GetDashboardCropsSummaryQuery';
import { DashboardCropsSummaryResponse } from './DashboardCropsSummaryFinder';
import { DashboardCropsSummaryFinder } from './DashboardCropsSummaryFinder';

export class GetDashboardCropsSummaryQueryHandler implements QueryHandler<GetDashboardCropsSummaryQuery, DashboardCropsSummaryResponse> {
  constructor(private finder: DashboardCropsSummaryFinder) {}

  subscribedTo(): Query {
    return GetDashboardCropsSummaryQuery;
  }

  async handle(query: GetDashboardCropsSummaryQuery): Promise<DashboardCropsSummaryResponse> {
    return this.finder.run(query.userId);
  }
}
