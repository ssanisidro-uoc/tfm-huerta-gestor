import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { PlantingId } from './value-objects/PlantingId';
import { CropId } from '../../Crop/domain/value-objects/CropId';
import { GardenId } from '../../Garden/domain/value-objects/GardenId';

export type PlantingStatus = 'planned' | 'seedling' | 'growing' | 'flowering' | 'fruiting' | 'harvesting' | 'completed' | 'archived' | 'failed';
export type HealthStatus = 'healthy' | 'fair' | 'poor' | 'critical';

export class Planting extends AggregateRoot {
  readonly id: PlantingId;
  readonly crop_id: CropId;
  readonly garden_id: GardenId;
  readonly plot_id: string;
  readonly created_by: string | null;
  readonly variety: string | null;
  readonly custom_name: string | null;
  readonly planted_at: Date;
  readonly expected_harvest_at: Date;
  readonly harvested_at: Date | null;
  readonly status: PlantingStatus;
  readonly health_status: HealthStatus;
  readonly quantity: number;
  readonly unit: string;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: PlantingId,
    crop_id: CropId,
    garden_id: GardenId,
    plot_id: string,
    created_by: string | null,
    variety: string | null,
    custom_name: string | null,
    planted_at: Date,
    expected_harvest_at: Date,
    harvested_at: Date | null,
    status: PlantingStatus,
    health_status: HealthStatus,
    quantity: number,
    unit: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.crop_id = crop_id;
    this.garden_id = garden_id;
    this.plot_id = plot_id;
    this.created_by = created_by;
    this.variety = variety;
    this.custom_name = custom_name;
    this.planted_at = planted_at;
    this.expected_harvest_at = expected_harvest_at;
    this.harvested_at = harvested_at;
    this.status = status;
    this.health_status = health_status;
    this.quantity = quantity;
    this.unit = unit;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(
    id: PlantingId,
    crop_id: CropId,
    garden_id: GardenId,
    plot_id: string,
    planted_at: Date,
    expected_harvest_at: Date,
    quantity: number,
    unit: string,
    created_by?: string,
    variety?: string,
    custom_name?: string
  ): Planting {
    const now = new Date();
    return new Planting(
      id,
      crop_id,
      garden_id,
      plot_id,
      created_by || null,
      variety || null,
      custom_name || null,
      planted_at,
      expected_harvest_at,
      null,
      'seedling',
      'healthy',
      quantity,
      unit,
      true,
      now,
      now
    );
  }

  static from_persistence(raw: any): Planting {
    return new Planting(
      new PlantingId(raw.id),
      new CropId(raw.crop_catalog_id),
      new GardenId(raw.garden_id),
      raw.plot_id,
      raw.created_by,
      raw.variety,
      raw.custom_name,
      new Date(raw.actual_planting_date || raw.planted_at || new Date()),
      new Date(raw.expected_harvest_date || raw.expected_harvest_at || new Date()),
      raw.first_harvest_date ? new Date(raw.first_harvest_date) : (raw.harvested_at ? new Date(raw.harvested_at) : null),
      raw.status || 'growing',
      raw.health_status || 'healthy',
      raw.quantity || 1,
      raw.unit || 'plants',
      raw.is_active !== false,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      crop_catalog_id: this.crop_id.get_value(),
      garden_id: this.garden_id.get_value(),
      plot_id: this.plot_id,
      created_by: this.created_by,
      variety: this.variety,
      custom_name: this.custom_name,
      actual_planting_date: this.planted_at,
      expected_harvest_date: this.expected_harvest_at,
      first_harvest_date: this.harvested_at,
      status: this.status,
      health_status: this.health_status,
      quantity: this.quantity,
      unit: this.unit,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  get_phenological_state(daysToMaturity: number): { phase: string; progress: number; description: string } {
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - this.planted_at.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.round((daysElapsed / daysToMaturity) * 100));

    let phase: string;
    let description: string;

    if (progress < 10) {
      phase = 'Germinación';
      description = 'La semilla está germinando. Mantener humedad constante.';
    } else if (progress < 30) {
      phase = 'Crecimiento';
      description = 'La plántula está creciendo. Necesita luz y nutrientes.';
    } else if (progress < 60) {
      phase = 'Desarrollo';
      description = 'La planta está desarrollando follaje y raíces.';
    } else if (progress < 80) {
      phase = 'Floración';
      description = 'La planta está floreciendo. Importante el riego regular.';
    } else if (progress < 100) {
      phase = 'Fructificación';
      description = 'Los frutos se están formando. Controlar plagas.';
    } else {
      phase = 'Maduración';
      description = 'El cultivo está listo para cosechar.';
    }

    return { phase, progress, description };
  }
}
