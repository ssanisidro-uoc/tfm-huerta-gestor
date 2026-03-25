import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindGardenByIdQuery } from './FindGardenByIdQuery';
import { FindGardenByIdResponse } from './FindGardenByIdResponse';
import { GardenByIdFinder } from './GardenByIdFinder';

export class FindGardenByIdQueryHandler implements QueryHandler<FindGardenByIdQuery, FindGardenByIdResponse> {
  constructor(private finder: GardenByIdFinder) {}

  subscribedTo(): Query {
    return FindGardenByIdQuery;
  }

  async handle(query: FindGardenByIdQuery): Promise<FindGardenByIdResponse> {
    const garden = await this.finder.run(query.id);
    if (!garden) {
      throw new Error(`Garden with id ${query.id} not found`);
    }

    const locationData = garden.location.to_persistence();

    return new FindGardenByIdResponse(
      garden.id.get_value(),
      garden.owner_id.get_value(),
      garden.name.get_value(),
      garden.description,
      garden.surface_m2.to_persistence(),
      garden.climate_zone.get_value(),
      garden.hardiness_zone?.get_value() ?? null,
      {
        address: locationData.location_address,
        city: locationData.location_city,
        region: locationData.location_region,
        country: locationData.location_country,
        latitude: locationData.location_latitude,
        longitude: locationData.location_longitude,
        timezone: locationData.location_timezone
      },
      garden.is_active,
      garden.created_at,
      garden.updated_at
    );
  }
}
