import { Query } from '../../../Shared/domain/Query';

export class GetTaskStatsQuery implements Query {
  constructor(readonly user_id: string) {}
}