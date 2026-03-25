import { Query } from '../../../Shared/domain/Query';

export class FindAllGardensQuery implements Query {
  constructor(
    readonly owner_id: string,
    readonly page: number = 1,
    readonly limit: number = 20
  ) {}
}
