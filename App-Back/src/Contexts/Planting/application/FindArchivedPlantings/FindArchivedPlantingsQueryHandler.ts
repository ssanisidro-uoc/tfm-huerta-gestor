import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindArchivedPlantingsQuery } from './FindArchivedPlantingsQuery';
import { FindArchivedPlantingsResponse } from './FindArchivedPlantingsResponse';
import { ArchivedPlantingsFinder } from './ArchivedPlantingsFinder';

export class FindArchivedPlantingsQueryHandler implements QueryHandler<FindArchivedPlantingsQuery, FindArchivedPlantingsResponse> {
  constructor(private finder: ArchivedPlantingsFinder) {}

  subscribedTo(): Query {
    return FindArchivedPlantingsQuery;
  }

  async handle(query: FindArchivedPlantingsQuery): Promise<FindArchivedPlantingsResponse> {
    const { plantings, cropRepository } = await this.finder.run(query.garden_id);
    
    const plantingsWithCropInfo = await Promise.all(
      plantings.map(async (planting) => {
        const crop = await cropRepository.search_by_id(planting.crop_id.get_value());
        return {
          id: planting.id.get_value(),
          crop_id: planting.crop_id.get_value(),
          crop_name: crop?.name.get_value() || 'Unknown',
          garden_id: planting.garden_id.get_value(),
          plot_id: planting.plot_id,
          planted_at: planting.planted_at,
          harvested_at: planting.harvested_at,
          quantity: planting.quantity,
          status: planting.status
        };
      })
    );

    return new FindArchivedPlantingsResponse(plantingsWithCropInfo);
  }
}
