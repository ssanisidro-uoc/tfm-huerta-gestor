import { Response } from '../../../Shared/domain/Response';

export class FindAllPlotsResponse implements Response {
  constructor(
    readonly plots: Array<{
      id: string;
      name: string;
      code: string | null;
      surface_m2: number;
      is_active: boolean;
    }>,
    readonly total: number,
    readonly page: number,
    readonly limit: number
  ) {}
}
