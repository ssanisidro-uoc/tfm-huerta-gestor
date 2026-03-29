import { Response } from '../../../Shared/domain/Response';

export class FindArchivedPlantingsResponse implements Response {
  constructor(
    readonly plantings: Array<{
      id: string;
      crop_id: string;
      crop_name: string;
      garden_id: string;
      plot_id: string;
      planted_at: Date;
      harvested_at: Date | null;
      quantity: number;
      status: string;
    }>
  ) {}
}
