import { Query } from '../../../Shared/domain/Query';

export class GetDashboardPlotsSummaryQuery implements Query {
  constructor(readonly userId: string) {}
}
