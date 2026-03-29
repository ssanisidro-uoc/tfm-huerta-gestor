import { Query } from '../../../Shared/domain/Query';

export class GetDashboardRecentActivityQuery implements Query {
  constructor(readonly userId: string) {}
}
