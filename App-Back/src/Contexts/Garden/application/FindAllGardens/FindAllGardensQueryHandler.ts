import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { FindAllGardensQuery } from './FindAllGardensQuery';
import { FindAllGardensResponse } from './FindAllGardensResponse';
import { AllGardensFinder } from './AllGardensFinder';

export class FindAllGardensQueryHandler implements QueryHandler<FindAllGardensQuery, FindAllGardensResponse> {
  constructor(private finder: AllGardensFinder) {}

  subscribedTo(): Query {
    return FindAllGardensQuery;
  }

  async handle(query: FindAllGardensQuery): Promise<FindAllGardensResponse> {
    const { gardens, total } = await this.finder.run(query.owner_id, query.page, query.limit);
    
    return new FindAllGardensResponse(
      gardens.map(garden => {
        const locationData = garden.location.to_persistence();
        return {
          id: garden.id.get_value(),
          name: garden.name.get_value(),
          description: garden.description,
          climate_zone: garden.climate_zone.get_value(),
          surface_m2: garden.surface_m2.to_persistence(),
          location: {
            address: locationData.location_address,
            city: locationData.location_city,
            region: locationData.location_region,
            country: locationData.location_country,
            latitude: locationData.location_latitude,
            longitude: locationData.location_longitude,
            timezone: locationData.location_timezone
          },
          is_active: garden.is_active,
          created_at: garden.created_at
        };
      }),
      total,
      query.page,
      query.limit
    );
  }
}
