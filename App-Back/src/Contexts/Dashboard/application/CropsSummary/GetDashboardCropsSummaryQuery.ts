import { Query } from '../../../Shared/domain/Query';

export class GetDashboardCropsSummaryQuery implements Query {
  constructor(readonly userId: string) {}
}
