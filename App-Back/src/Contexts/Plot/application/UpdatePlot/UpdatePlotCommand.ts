import { Command } from '../../../Shared/domain/Command';

interface UpdatePlotBody {
  name?: string;
  code?: string | null;
  description?: string | null;
  surface_m2?: number;
  length_m?: number | null;
  width_m?: number | null;
  shape?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  plot_order?: number | null;
  soil_type?: string | null;
  soil_ph?: number | null;
  soil_quality?: string | null;
  soil_notes?: string | null;
  irrigation_type?: string;
  irrigation_flow_rate?: number | null;
  irrigation_notes?: string | null;
  has_water_access?: boolean;
  orientation?: string | null;
  sun_exposure_hours?: number | null;
  shade_level?: string | null;
  has_greenhouse?: boolean;
  has_raised_bed?: boolean;
  has_mulch?: boolean;
  accessibility?: string | null;
  restrictions?: string | null;
  is_active?: boolean;
}

export class UpdatePlotCommand implements Command {
  constructor(
    readonly id: string,
    readonly data: UpdatePlotBody
  ) {}
}
