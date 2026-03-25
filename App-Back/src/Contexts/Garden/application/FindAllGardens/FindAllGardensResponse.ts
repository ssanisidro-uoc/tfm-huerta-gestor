import { Response } from '../../../Shared/domain/Response';

interface GardenLocationResponse {
  address: string | null;
  city: string | null;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

export class FindAllGardensResponse implements Response {
  constructor(
    readonly gardens: Array<{
      id: string;
      name: string;
      description: string | null;
      climate_zone: string;
      surface_m2: number | null;
      location: GardenLocationResponse;
      is_active: boolean;
      created_at: Date;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
