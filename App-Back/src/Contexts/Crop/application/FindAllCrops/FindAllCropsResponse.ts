import { Response } from '../../../Shared/domain/Response';

export class FindAllCropsResponse implements Response {
  constructor(
    readonly crops: Array<{
      id: string;
      name: string;
      scientific_name: string;
      family: string;
      category: string;
      days_to_harvest_min: number;
      days_to_harvest_max: number;
      sun_requirement: string;
      water_requirement: string;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
