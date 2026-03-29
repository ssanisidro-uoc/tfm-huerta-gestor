import { GardenId } from '../../../Garden/domain/value-objects/GardenId';
import { Plot } from '../../domain/Plot';
import { PlotRepository } from '../../domain/PlotRepository';
import { PlotAccessibility } from '../../domain/value-objects/PlotAccessibility';
import { PlotDimensions } from '../../domain/value-objects/PlotDimensions';
import { PlotId } from '../../domain/value-objects/PlotId';
import { PlotIrrigationType } from '../../domain/value-objects/PlotIrrigationType';
import { PlotName } from '../../domain/value-objects/PlotName';
import { PlotOrientation } from '../../domain/value-objects/PlotOrientation';
import { PlotPosition } from '../../domain/value-objects/PlotPosition';
import { PlotShadeLevel } from '../../domain/value-objects/PlotShadeLevel';
import { PlotShape } from '../../domain/value-objects/PlotShape';
import { PlotSoil } from '../../domain/value-objects/PlotSoil';
import { PlotSurface } from '../../domain/value-objects/PlotSurface';

interface CreatePlotData {
  id: string;
  garden_id: string;
  name: string;
  code?: string | null;
  surface_m2: number;
  description?: string | null;
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
}

export class PlotCreator {
  constructor(private repository: PlotRepository) {}

  async run(data: CreatePlotData): Promise<Plot> {
    const now = new Date();

    const plot = new Plot({
      id: new PlotId(data.id),
      garden_id: new GardenId(data.garden_id),
      name: new PlotName(data.name),
      code: data.code ?? null,
      description: data.description ?? null,
      surface: PlotSurface.create(data.surface_m2),
      dimensions: PlotDimensions.create({
        length: data.length_m ?? null,
        width: data.width_m ?? null
      }),
      position: PlotPosition.create({
        x: data.position_x ?? null,
        y: data.position_y ?? null,
        order: data.plot_order ?? null
      }),
      shape: data.shape ? new PlotShape(data.shape) : null,
      soil: PlotSoil.create({
        type: data.soil_type,
        ph: data.soil_ph,
        quality: data.soil_quality,
        notes: data.soil_notes
      }),
      irrigation_type: new PlotIrrigationType(data.irrigation_type ?? 'manual'),
      irrigation_flow_rate: data.irrigation_flow_rate ?? null,
      irrigation_notes: data.irrigation_notes ?? null,
      has_water_access: data.has_water_access ?? true,
      orientation: data.orientation ? new PlotOrientation(data.orientation) : null,
      sun_exposure_hours: data.sun_exposure_hours ?? null,
      shade_level: data.shade_level ? new PlotShadeLevel(data.shade_level) : null,
      has_greenhouse: data.has_greenhouse ?? false,
      has_raised_bed: data.has_raised_bed ?? false,
      has_mulch: data.has_mulch ?? false,
      accessibility: data.accessibility ? new PlotAccessibility(data.accessibility) : null,
      restrictions: data.restrictions ?? null,
      is_active: true,
      created_at: now,
      updated_at: now
    });

    await this.repository.save(plot);
    return plot;
  }
}
