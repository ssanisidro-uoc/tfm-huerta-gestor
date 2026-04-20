import { Query } from '../../../Shared/domain/Query';

export class GetWeatherObservationsByGardenQuery extends Query {
  constructor(readonly gardenId: string) {
    super();
  }
}

export class GetWeatherApiUsageQuery extends Query {
  constructor(
    readonly locationId?: string,
    readonly days: number = 30
  ) {
    super();
  }
}

export class GetWeatherAlertsByGardenQuery extends Query {
  constructor(readonly gardenId: string) {
    super();
  }
}

export class GetActiveWeatherAlertsQuery extends Query {
  constructor(readonly gardenId: string) {
    super();
  }
}

export class GetWeatherRecommendationsQuery extends Query {
  constructor(
    readonly gardenId: string,
    readonly days: number = 7
  ) {
    super();
  }
}

export class GetWeatherAlertsOnlyQuery extends Query {
  constructor(readonly gardenId: string) {
    super();
  }
}