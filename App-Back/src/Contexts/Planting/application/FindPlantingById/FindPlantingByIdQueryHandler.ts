import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindPlantingByIdQuery } from './FindPlantingByIdQuery';
import { FindPlantingByIdResponse } from './FindPlantingByIdResponse';
import { PlantingByIdFinder } from './PlantingByIdFinder';

export class FindPlantingByIdQueryHandler implements QueryHandler<FindPlantingByIdQuery, FindPlantingByIdResponse> {
  constructor(private finder: PlantingByIdFinder) {}

  subscribedTo(): Query {
    return FindPlantingByIdQuery;
  }

  async handle(query: FindPlantingByIdQuery): Promise<FindPlantingByIdResponse> {
    const planting = await this.finder.run(query.id);
    if (!planting) {
      throw new Error(`Planting with id ${query.id} not found`);
    }
    return new FindPlantingByIdResponse(
      planting.id.get_value(),
      planting.crop_id.get_value(),
      planting.garden_id.get_value(),
      planting.plot_id,
      planting.planted_at,
      planting.expected_harvest_at,
      planting.harvested_at,
      planting.quantity,
      planting.unit,
      planting.is_active
    );
  }
}
