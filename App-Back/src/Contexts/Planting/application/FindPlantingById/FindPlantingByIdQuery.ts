import { Query } from '../../../Shared/domain/Query';

export class FindPlantingByIdQuery implements Query {
  constructor(readonly id: string) {}
}
