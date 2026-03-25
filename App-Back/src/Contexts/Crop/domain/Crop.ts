import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { CropId } from './value-objects/CropId';
import { CropName } from './value-objects/CropName';

export class Crop extends AggregateRoot {
  readonly id: CropId;
  readonly name: CropName;
  readonly scientific_name: string;
  readonly family: string;
  readonly days_to_maturity: number;
  readonly min_temperature: number;
  readonly max_temperature: number;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: CropId,
    name: CropName,
    scientific_name: string,
    family: string,
    days_to_maturity: number,
    min_temperature: number,
    max_temperature: number,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.name = name;
    this.scientific_name = scientific_name;
    this.family = family;
    this.days_to_maturity = days_to_maturity;
    this.min_temperature = min_temperature;
    this.max_temperature = max_temperature;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static from_persistence(raw: any): Crop {
    return new Crop(
      new CropId(raw.id),
      new CropName(raw.name),
      raw.scientific_name,
      raw.family,
      raw.days_to_maturity,
      raw.min_temperature,
      raw.max_temperature,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      name: this.name.get_value(),
      scientific_name: this.scientific_name,
      family: this.family,
      days_to_maturity: this.days_to_maturity,
      min_temperature: this.min_temperature,
      max_temperature: this.max_temperature,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
