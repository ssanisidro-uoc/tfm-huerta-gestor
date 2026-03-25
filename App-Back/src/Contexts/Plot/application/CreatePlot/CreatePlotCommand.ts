import { Command } from '../../../Shared/domain/Command';

export class CreatePlotCommand extends Command {
  constructor(
    readonly id: string,
    readonly garden_id: string,
    readonly name: string,
    readonly code: string | null,
    readonly surface_m2: number,
    readonly description: string | null,
    readonly length_m: number | null,
    readonly width_m: number | null,
    readonly shape: string | null,
    readonly position_x: number | null,
    readonly position_y: number | null,
    readonly plot_order: number | null,
    readonly soil_type: string | null,
    readonly soil_ph: number | null,
    readonly soil_quality: string | null,
    readonly soil_notes: string | null,
    readonly irrigation_type: string,
    readonly irrigation_flow_rate: number | null,
    readonly irrigation_notes: string | null,
    readonly has_water_access: boolean,
    readonly orientation: string | null,
    readonly sun_exposure_hours: number | null,
    readonly shade_level: string | null,
    readonly has_greenhouse: boolean,
    readonly has_raised_bed: boolean,
    readonly has_mulch: boolean,
    readonly accessibility: string | null,
    readonly restrictions: string | null
  ) {
    super();
  }
}
