import { Query } from '../../../Shared/domain/Query';

export class FindPlantingsQuery implements Query {
  constructor(readonly userId: string) {}
}
