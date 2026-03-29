import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetDashboardPlotsSummaryQuery } from './GetDashboardPlotsSummaryQuery';
import { DashboardPlotsSummaryResponse, PlotSummary } from './DashboardPlotsSummaryFinder';
import { DashboardPlotsSummaryFinder } from './DashboardPlotsSummaryFinder';

export class GetDashboardPlotsSummaryQueryHandler implements QueryHandler<GetDashboardPlotsSummaryQuery, DashboardPlotsSummaryResponse> {
  constructor(private finder: DashboardPlotsSummaryFinder) {}

  subscribedTo(): Query {
    return GetDashboardPlotsSummaryQuery;
  }

  async handle(query: GetDashboardPlotsSummaryQuery): Promise<DashboardPlotsSummaryResponse> {
    return this.finder.run(query.userId);
  }
}
