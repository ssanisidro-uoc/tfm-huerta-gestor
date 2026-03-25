import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { PlotId } from './value-objects/PlotId';
import { PlotName } from './value-objects/PlotName';
import { GardenId } from '../../Garden/domain/value-objects/GardenId';
import { PlotSurface } from './value-objects/PlotSurface';
import { PlotDimensions } from './value-objects/PlotDimensions';
import { PlotShape } from './value-objects/PlotShape';
import { PlotPosition } from './value-objects/PlotPosition';
import { PlotSoil } from './value-objects/PlotSoil';
import { PlotIrrigationType } from './value-objects/PlotIrrigationType';
import { PlotOrientation } from './value-objects/PlotOrientation';
import { PlotShadeLevel } from './value-objects/PlotShadeLevel';
import { PlotAccessibility } from './value-objects/PlotAccessibility';

interface PlotProps {
  id: PlotId;
  garden_id: GardenId;
  name: PlotName;
  code: string | null;
  description: string | null;
  surface: PlotSurface;
  dimensions: PlotDimensions;
  position: PlotPosition;
  shape: PlotShape | null;
  soil: PlotSoil;
  irrigation_type: PlotIrrigationType;
  irrigation_flow_rate: number | null;
  irrigation_notes: string | null;
  has_water_access: boolean;
  orientation: PlotOrientation | null;
  sun_exposure_hours: number | null;
  shade_level: PlotShadeLevel | null;
  has_greenhouse: boolean;
  has_raised_bed: boolean;
  has_mulch: boolean;
  accessibility: PlotAccessibility | null;
  restrictions: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class Plot extends AggregateRoot {
  readonly id: PlotId;
  readonly garden_id: GardenId;
  readonly name: PlotName;
  readonly code: string | null;
  readonly description: string | null;
  readonly surface: PlotSurface;
  readonly dimensions: PlotDimensions;
  readonly position: PlotPosition;
  readonly shape: PlotShape | null;
  readonly soil: PlotSoil;
  readonly irrigation_type: PlotIrrigationType;
  readonly irrigation_flow_rate: number | null;
  readonly irrigation_notes: string | null;
  readonly has_water_access: boolean;
  readonly orientation: PlotOrientation | null;
  readonly sun_exposure_hours: number | null;
  readonly shade_level: PlotShadeLevel | null;
  readonly has_greenhouse: boolean;
  readonly has_raised_bed: boolean;
  readonly has_mulch: boolean;
  readonly accessibility: PlotAccessibility | null;
  readonly restrictions: string | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(props: PlotProps) {
    super();
    this.id = props.id;
    this.garden_id = props.garden_id;
    this.name = props.name;
    this.code = props.code;
    this.description = props.description;
    this.surface = props.surface;
    this.dimensions = props.dimensions;
    this.position = props.position;
    this.shape = props.shape;
    this.soil = props.soil;
    this.irrigation_type = props.irrigation_type;
    this.irrigation_flow_rate = props.irrigation_flow_rate;
    this.irrigation_notes = props.irrigation_notes;
    this.has_water_access = props.has_water_access;
    this.orientation = props.orientation;
    this.sun_exposure_hours = props.sun_exposure_hours;
    this.shade_level = props.shade_level;
    this.has_greenhouse = props.has_greenhouse;
    this.has_raised_bed = props.has_raised_bed;
    this.has_mulch = props.has_mulch;
    this.accessibility = props.accessibility;
    this.restrictions = props.restrictions;
    this.is_active = props.is_active;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }

  static create(data: {
    id: PlotId;
    garden_id: GardenId;
    name: PlotName;
    code?: string | null;
    surface_m2: number;
  }): Plot {
    const now = new Date();
    return new Plot({
      id: data.id,
      garden_id: data.garden_id,
      name: data.name,
      code: data.code ?? null,
      description: null,
      surface: PlotSurface.create(data.surface_m2),
      dimensions: PlotDimensions.create(null, null),
      position: PlotPosition.create(null, null, null),
      shape: null,
      soil: PlotSoil.create({}),
      irrigation_type: PlotIrrigationType.manual(),
      irrigation_flow_rate: null,
      irrigation_notes: null,
      has_water_access: true,
      orientation: null,
      sun_exposure_hours: null,
      shade_level: null,
      has_greenhouse: false,
      has_raised_bed: false,
      has_mulch: false,
      accessibility: null,
      restrictions: null,
      is_active: true,
      created_at: now,
      updated_at: now
    });
  }

  static from_persistence(raw: {
    id: string;
    garden_id: string;
    name: string;
    code: string | null;
    description: string | null;
    surface_m2: number;
    length_m: number | null;
    width_m: number | null;
    shape: string | null;
    position_x: number | null;
    position_y: number | null;
    plot_order: number | null;
    soil_type: string | null;
    soil_ph: number | null;
    soil_quality: string | null;
    soil_notes: string | null;
    last_soil_analysis_date: Date | null;
    irrigation_type: string;
    irrigation_flow_rate: number | null;
    irrigation_notes: string | null;
    has_water_access: boolean;
    orientation: string | null;
    sun_exposure_hours: number | null;
    shade_level: string | null;
    has_greenhouse: boolean;
    has_raised_bed: boolean;
    has_mulch: boolean;
    accessibility: string | null;
    restrictions: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): Plot {
    return new Plot({
      id: new PlotId(raw.id),
      garden_id: new GardenId(raw.garden_id),
      name: new PlotName(raw.name),
      code: raw.code,
      description: raw.description,
      surface: PlotSurface.from_persistence(raw.surface_m2),
      dimensions: PlotDimensions.from_persistence({ length_m: raw.length_m, width_m: raw.width_m }),
      position: PlotPosition.from_persistence(raw),
      shape: raw.shape ? new PlotShape(raw.shape) : null,
      soil: PlotSoil.from_persistence(raw),
      irrigation_type: new PlotIrrigationType(raw.irrigation_type),
      irrigation_flow_rate: raw.irrigation_flow_rate,
      irrigation_notes: raw.irrigation_notes,
      has_water_access: raw.has_water_access,
      orientation: raw.orientation ? new PlotOrientation(raw.orientation) : null,
      sun_exposure_hours: raw.sun_exposure_hours,
      shade_level: raw.shade_level ? new PlotShadeLevel(raw.shade_level) : null,
      has_greenhouse: raw.has_greenhouse,
      has_raised_bed: raw.has_raised_bed,
      has_mulch: raw.has_mulch,
      accessibility: raw.accessibility ? new PlotAccessibility(raw.accessibility) : null,
      restrictions: raw.restrictions,
      is_active: raw.is_active,
      created_at: new Date(raw.created_at),
      updated_at: new Date(raw.updated_at)
    });
  }

  to_persistence(): {
    id: string;
    garden_id: string;
    name: string;
    code: string | null;
    description: string | null;
    surface_m2: number;
    length_m: number | null;
    width_m: number | null;
    shape: string | null;
    position_x: number | null;
    position_y: number | null;
    plot_order: number | null;
    soil_type: string | null;
    soil_ph: number | null;
    soil_quality: string | null;
    soil_notes: string | null;
    last_soil_analysis_date: Date | null;
    irrigation_type: string;
    irrigation_flow_rate: number | null;
    irrigation_notes: string | null;
    has_water_access: boolean;
    orientation: string | null;
    sun_exposure_hours: number | null;
    shade_level: string | null;
    has_greenhouse: boolean;
    has_raised_bed: boolean;
    has_mulch: boolean;
    accessibility: string | null;
    restrictions: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  } {
    const dimensionsData = this.dimensions.to_persistence();
    const positionData = this.position.to_persistence();
    const soilData = this.soil.to_persistence();

    return {
      id: this.id.get_value(),
      garden_id: this.garden_id.get_value(),
      name: this.name.get_value(),
      code: this.code,
      description: this.description,
      surface_m2: this.surface.to_persistence(),
      length_m: dimensionsData.length_m,
      width_m: dimensionsData.width_m,
      shape: this.shape?.get_value() ?? null,
      position_x: positionData.position_x,
      position_y: positionData.position_y,
      plot_order: positionData.plot_order,
      soil_type: soilData.soil_type,
      soil_ph: soilData.soil_ph,
      soil_quality: soilData.soil_quality,
      soil_notes: soilData.soil_notes,
      last_soil_analysis_date: soilData.last_soil_analysis_date,
      irrigation_type: this.irrigation_type.get_value(),
      irrigation_flow_rate: this.irrigation_flow_rate,
      irrigation_notes: this.irrigation_notes,
      has_water_access: this.has_water_access,
      orientation: this.orientation?.get_value() ?? null,
      sun_exposure_hours: this.sun_exposure_hours,
      shade_level: this.shade_level?.get_value() ?? null,
      has_greenhouse: this.has_greenhouse,
      has_raised_bed: this.has_raised_bed,
      has_mulch: this.has_mulch,
      accessibility: this.accessibility?.get_value() ?? null,
      restrictions: this.restrictions,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  update(data: Partial<{
    name: PlotName;
    code: string | null;
    description: string | null;
    surface_m2: number;
    dimensions: PlotDimensions;
    position: PlotPosition;
    shape: PlotShape | null;
    soil: PlotSoil;
    irrigation_type: PlotIrrigationType;
    irrigation_flow_rate: number | null;
    irrigation_notes: string | null;
    has_water_access: boolean;
    orientation: PlotOrientation | null;
    sun_exposure_hours: number | null;
    shade_level: PlotShadeLevel | null;
    has_greenhouse: boolean;
    has_raised_bed: boolean;
    has_mulch: boolean;
    accessibility: PlotAccessibility | null;
    restrictions: string | null;
    is_active: boolean;
  }>): Plot {
    return new Plot({
      id: this.id,
      garden_id: this.garden_id,
      name: data.name ?? this.name,
      code: data.code !== undefined ? data.code : this.code,
      description: data.description !== undefined ? data.description : this.description,
      surface: data.surface_m2 !== undefined ? PlotSurface.create(data.surface_m2) : this.surface,
      dimensions: data.dimensions ?? this.dimensions,
      position: data.position ?? this.position,
      shape: data.shape !== undefined ? data.shape : this.shape,
      soil: data.soil ?? this.soil,
      irrigation_type: data.irrigation_type ?? this.irrigation_type,
      irrigation_flow_rate: data.irrigation_flow_rate !== undefined ? data.irrigation_flow_rate : this.irrigation_flow_rate,
      irrigation_notes: data.irrigation_notes !== undefined ? data.irrigation_notes : this.irrigation_notes,
      has_water_access: data.has_water_access ?? this.has_water_access,
      orientation: data.orientation ?? this.orientation,
      sun_exposure_hours: data.sun_exposure_hours ?? this.sun_exposure_hours,
      shade_level: data.shade_level ?? this.shade_level,
      has_greenhouse: data.has_greenhouse ?? this.has_greenhouse,
      has_raised_bed: data.has_raised_bed ?? this.has_raised_bed,
      has_mulch: data.has_mulch ?? this.has_mulch,
      accessibility: data.accessibility ?? this.accessibility,
      restrictions: data.restrictions !== undefined ? data.restrictions : this.restrictions,
      is_active: data.is_active ?? this.is_active,
      created_at: this.created_at,
      updated_at: new Date()
    });
  }
}
