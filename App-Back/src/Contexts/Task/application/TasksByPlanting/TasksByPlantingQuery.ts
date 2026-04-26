import { Query } from '../../../Shared/domain/Query';

export class TasksByPlantingQuery implements Query {
  constructor(
    readonly planting_id: string,
    readonly user_id: string
  ) {}
}
