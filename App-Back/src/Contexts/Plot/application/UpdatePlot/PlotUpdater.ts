import { Plot } from '../../domain/Plot';
import { PlotRepository } from '../../domain/PlotRepository';
import { PlotNotFoundError } from '../../domain/errors/PlotErrors';
import { PlotAccessibility } from '../../domain/value-objects/PlotAccessibility';
import { PlotDimensions } from '../../domain/value-objects/PlotDimensions';
import { PlotIrrigationType } from '../../domain/value-objects/PlotIrrigationType';
import { PlotName } from '../../domain/value-objects/PlotName';
import { PlotOrientation } from '../../domain/value-objects/PlotOrientation';
import { PlotPosition } from '../../domain/value-objects/PlotPosition';
import { PlotShadeLevel } from '../../domain/value-objects/PlotShadeLevel';
import { PlotShape } from '../../domain/value-objects/PlotShape';
import { PlotSoil } from '../../domain/value-objects/PlotSoil';

export class PlotUpdater {
  constructor(private repository: PlotRepository) {}

  async run(
    id: string,
    data: {
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
  ): Promise<Plot> {
    const plot = await this.repository.search_by_id(id);

    if (!plot) {
      throw new PlotNotFoundError(id);
    }

    const updatedPlot = plot.update({
      name: data.name ? new PlotName(data.name) : undefined,
      code: data.code,
      description: data.description,
      surface_m2: data.surface_m2 ? data.surface_m2 : undefined,
      dimensions:
        data.length_m && data.width_m
          ? PlotDimensions.create({ length: data.length_m, width: data.width_m })
          : undefined,
      position:
        data.position_x !== undefined || data.position_y !== undefined
          ? PlotPosition.create({
              x: data.position_x ?? plot.position.x,
              y: data.position_y ?? plot.position.y,
              order: data.plot_order ?? plot.position.order
            })
          : undefined,
      shape: data.shape ? PlotShape.create(data.shape) : undefined,
      soil:
        data.soil_type || data.soil_ph || data.soil_quality
          ? PlotSoil.create({
              type: data.soil_type ?? plot.soil.type,
              ph: data.soil_ph ?? plot.soil.ph,
              quality: data.soil_quality ?? plot.soil.quality,
              notes: data.soil_notes ?? plot.soil.notes
            })
          : undefined,
      irrigation_type: data.irrigation_type
        ? PlotIrrigationType.create(data.irrigation_type)
        : undefined,
      irrigation_flow_rate: data.irrigation_flow_rate,
      irrigation_notes: data.irrigation_notes,
      has_water_access: data.has_water_access,
      orientation: data.orientation ? PlotOrientation.create(data.orientation) : undefined,
      sun_exposure_hours: data.sun_exposure_hours,
      shade_level: data.shade_level ? PlotShadeLevel.create(data.shade_level) : undefined,
      has_greenhouse: data.has_greenhouse,
      has_raised_bed: data.has_raised_bed,
      has_mulch: data.has_mulch,
      accessibility: data.accessibility ? PlotAccessibility.create(data.accessibility) : undefined,
      restrictions: data.restrictions,
      is_active: data.is_active
    });

    await this.repository.save(updatedPlot);
    return updatedPlot;
  }
}
