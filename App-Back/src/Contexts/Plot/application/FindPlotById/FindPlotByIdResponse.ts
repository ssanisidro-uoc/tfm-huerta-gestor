import { Response } from '../../../Shared/domain/Response';

export class FindPlotByIdResponse implements Response {
  constructor(
    readonly id: string,
    readonly garden_id: string,
    readonly name: string,
    readonly code: string | null,
    readonly description: string | null,
    readonly surface_m2: number,
    readonly irrigation_type: string,
    readonly has_water_access: boolean,
    readonly has_greenhouse: boolean,
    readonly has_raised_bed: boolean,
    readonly has_mulch: boolean,
    readonly is_active: boolean,
    readonly created_at: Date,
    readonly updated_at: Date
  ) {}
}
