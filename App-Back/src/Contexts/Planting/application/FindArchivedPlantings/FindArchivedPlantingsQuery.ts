import { Query } from '../../../Shared/domain/Query';

export class FindArchivedPlantingsQuery implements Query {
  constructor(
    readonly garden_id: string
  ) {}
}
