import { Query } from '../../../Shared/domain/Query';

export class FindAllCropsQuery implements Query {
  constructor(
    readonly page: number = 1,
    readonly limit: number = 20,
    readonly filters?: {
      category?: string;
      family?: string;
    }
  ) {}
}
