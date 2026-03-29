import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindPlantingsQuery } from './FindPlantingsQuery';
import { FindPlantingsResponse } from './FindPlantingsResponse';
import { PlantingsFinder } from './PlantingsFinder';

export class FindPlantingsQueryHandler implements QueryHandler<FindPlantingsQuery, FindPlantingsResponse> {
  constructor(private finder: PlantingsFinder) {}

  subscribedTo(): Query {
    return FindPlantingsQuery;
  }

  async handle(query: FindPlantingsQuery): Promise<FindPlantingsResponse> {
    const result = await this.finder.run(query.userId);
    return new FindPlantingsResponse(result.plantings);
  }
}
