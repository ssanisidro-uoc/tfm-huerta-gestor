import { Query } from '../../../Shared/domain/Query';

export class GetPlantingStatusQuery extends Query {
  constructor(
    readonly planting_id: string,
    readonly user_id: string
  ) {
    super();
  }
}
