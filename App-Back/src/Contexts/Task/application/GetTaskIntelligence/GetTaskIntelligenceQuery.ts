import { Query } from '../../../Shared/domain/Query';

export class GetTaskIntelligenceQuery implements Query {
  constructor(
    readonly taskId: string
  ) {}
}
