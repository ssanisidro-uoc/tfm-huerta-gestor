export class FindPlantingsResponse {
  constructor(
    readonly plantings: Array<{
      id: string;
      crop_id: string;
      garden_id: string;
      plot_id: string;
      planted_at: Date;
      expected_harvest_at: Date;
      harvested_at: Date | null;
      quantity: number;
      status: string;
    }>
  ) {}
}
