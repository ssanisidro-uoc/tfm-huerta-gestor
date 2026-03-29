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
  readonly is_active: boolean;
  readonly total_harvest_kg: number | null;
  readonly harvest_quality: string | null;
  readonly harvest_notes: string | null;
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
    is_active: boolean,
    total_harvest_kg: number | null,
    harvest_quality: string | null,
    harvest_notes: string | null,
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
    this.is_active = is_active;
    this.total_harvest_kg = total_harvest_kg;
    this.harvest_quality = harvest_quality;
    this.harvest_notes = harvest_notes;
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
      'growing',
      'healthy',
      quantity,
      true,
      null,
      null,
      null,
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
      new Date(raw.actual_planting_date || new Date()),
      new Date(raw.expected_harvest_date || new Date()),
      raw.first_harvest_date ? new Date(raw.first_harvest_date) : (raw.last_harvest_date ? new Date(raw.last_harvest_date) : null),
      raw.status || 'growing',
      raw.health_status || 'healthy',
      raw.quantity || 1,
      raw.is_active !== false,
      raw.total_harvest_kg ? Number(raw.total_harvest_kg) : null,
      raw.harvest_quality || null,
      raw.harvest_notes || null,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    const today = new Date().toISOString().split('T')[0];
    
    const formatDate = (date: Date | undefined | null): string | null => {
      if (!date) return today;
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return today;
    };

    const plantedDate = formatDate(this.planted_at);
    const harvestDate = formatDate(this.expected_harvest_at);

    return {
      id: this.id.get_value(),
      crop_catalog_id: this.crop_id.get_value(),
      garden_id: this.garden_id.get_value(),
      plot_id: this.plot_id,
      created_by: this.created_by,
      variety: this.variety,
      custom_name: this.custom_name,
      planned_planting_date: plantedDate,
      actual_planting_date: plantedDate,
      expected_harvest_date: harvestDate,
      first_harvest_date: this.harvested_at ? formatDate(this.harvested_at) : null,
      status: this.status,
      health_status: this.health_status,
      quantity: this.quantity,
      is_active: this.is_active,
      total_harvest_kg: this.total_harvest_kg,
      harvest_quality: this.harvest_quality,
      harvest_notes: this.harvest_notes,
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
