import { Query } from '../../../Shared/domain/Query';

export class GetGardenIntelligenceQuery implements Query {
  constructor(
    readonly gardenId: string,
    readonly daysAhead: number
  ) {}
}
