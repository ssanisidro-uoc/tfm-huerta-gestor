import { Query } from '../../../Shared/domain/Query';

export class FindAllPlotsQuery implements Query {
  constructor(
    readonly garden_id: string,
    readonly page: number = 1,
    readonly limit: number = 20
  ) {}
}
