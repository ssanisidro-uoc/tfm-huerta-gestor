export class FindPlantingByIdResponse {
  constructor(
    readonly id: string,
    readonly crop_id: string,
    readonly garden_id: string,
    readonly plot_id: string,
    readonly planted_at: Date,
    readonly expected_harvest_at: Date,
    readonly harvested_at: Date | null,
    readonly quantity: number,
    readonly unit: string,
    readonly is_active: boolean
  ) {}
}
