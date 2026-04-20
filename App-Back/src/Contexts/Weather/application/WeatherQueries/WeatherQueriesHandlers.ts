import { QueryHandler } from '../../../Shared/domain/QueryHandler';
import { Query } from '../../../Shared/domain/Query';
import { GetWeatherObservationsByGardenQuery, GetWeatherApiUsageQuery } from './WeatherQueries';
import { WeatherObservationsRepository, WeatherApiRequestsRepository } from '../WeatherObservationsService';

export class GetWeatherObservationsByGardenQueryHandler implements QueryHandler<GetWeatherObservationsByGardenQuery, any> {
  constructor(private repository: WeatherObservationsRepository) {}

  subscribedTo(): Query {
    return GetWeatherObservationsByGardenQuery;
  }

  async handle(query: GetWeatherObservationsByGardenQuery): Promise<any> {
    return this.repository.findByGarden(query.gardenId);
  }
}

export class GetWeatherApiUsageQueryHandler implements QueryHandler<GetWeatherApiUsageQuery, any> {
  constructor(private repository: WeatherApiRequestsRepository) {}

  subscribedTo(): Query {
    return GetWeatherApiUsageQuery;
  }

  async handle(query: GetWeatherApiUsageQuery): Promise<any> {
    return this.repository.getUsageStats(query.locationId, query.days);
  }
}