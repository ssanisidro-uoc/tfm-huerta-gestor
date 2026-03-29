import { Query } from '../../../Shared/domain/Query';

export class GetDashboardStatsQuery implements Query {
  constructor(readonly userId: string) {}
}
