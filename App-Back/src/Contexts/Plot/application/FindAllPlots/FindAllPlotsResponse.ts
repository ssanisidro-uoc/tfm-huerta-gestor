import { Response } from '../../../Shared/domain/Response';

export class FindAllPlotsResponse implements Response {
  constructor(
    readonly plots: Array<{
      id: string;
      name: string;
      code: string | null;
      surface_m2: number;
      is_active: boolean;
      crops?: Array<{
        id: string;
        crop_id: string;
        name: string;
        growth_percentage: number;
        planted_at: string;
        status: string;
      }>;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
