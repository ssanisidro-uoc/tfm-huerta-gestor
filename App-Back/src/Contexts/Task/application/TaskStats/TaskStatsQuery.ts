import { Query } from '../../../Shared/domain/Query';

export class TaskStatsQuery implements Query {
  constructor(
    readonly userId: string
  ) {}
}
