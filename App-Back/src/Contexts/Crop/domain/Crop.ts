import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { CropId } from './value-objects/CropId';
import { CropName } from './value-objects/CropName';

export class Crop extends AggregateRoot {
  readonly id: CropId;
  readonly name: CropName;
  readonly scientific_name: string;
  readonly family: string;
  readonly category: string;
  readonly lifecycle: string;
  readonly growth_habit: string;
  readonly days_to_harvest_min: number;
  readonly days_to_harvest_max: number;
  readonly days_to_maturity: number; // Nueva propiedad
  readonly days_to_germination: number;
  readonly min_temperature_c: number;
  readonly max_temperature_c: number;
  readonly optimal_temperature_min_c: number;
  readonly optimal_temperature_max_c: number;
  readonly frost_tolerant: boolean;
  readonly heat_tolerant: boolean;
  readonly sun_requirement: string;
  readonly min_sun_hours: number;
  readonly shade_tolerance: string;
  readonly preferred_soil_types: string[];
  readonly min_soil_ph: number;
  readonly max_soil_ph: number;
  readonly soil_depth_requirement: string;
  readonly soil_fertility_requirement: string;
  readonly water_requirement: string;
  readonly drought_tolerant: boolean;
  readonly waterlogging_tolerant: boolean;
  readonly recommended_spacing_cm: number;
  readonly recommended_row_spacing_cm: number;
  readonly seed_depth_cm: number;
  readonly sowing_start_month: number;
  readonly sowing_end_month: number;
  readonly harvest_start_month: number;
  readonly harvest_end_month: number;
  readonly companion_crops: string[];
  readonly incompatible_crops: string[];
  readonly rotation_group: string;
  readonly years_before_replant: number;
  readonly common_pests: any;
  readonly common_diseases: any;
  readonly pest_resistance_level: string;
  readonly nitrogen_fixer: boolean;
  readonly attracts_pollinators: boolean;
  readonly attracts_beneficial_insects: boolean;
  readonly average_yield_kg_per_m2: number;
  readonly harvest_type: string;
  readonly preferred_moon_phase: string;
  readonly biodynamic_type: string;
  readonly description: string;
  readonly growing_tips: string;
  readonly culinary_uses: string;
  readonly nutritional_info: any;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: CropId,
    name: CropName,
    scientific_name: string,
    family: string,
    category: string,
    lifecycle: string,
    growth_habit: string,
    days_to_harvest_min: number,
    days_to_harvest_max: number,
    days_to_maturity: number, // Nuevo parámetro
    days_to_germination: number,
    min_temperature_c: number,
    max_temperature_c: number,
    optimal_temperature_min_c: number,
    optimal_temperature_max_c: number,
    frost_tolerant: boolean,
    heat_tolerant: boolean,
    sun_requirement: string,
    min_sun_hours: number,
    shade_tolerance: string,
    preferred_soil_types: string[],
    min_soil_ph: number,
    max_soil_ph: number,
    soil_depth_requirement: string,
    soil_fertility_requirement: string,
    water_requirement: string,
    drought_tolerant: boolean,
    waterlogging_tolerant: boolean,
    recommended_spacing_cm: number,
    recommended_row_spacing_cm: number,
    seed_depth_cm: number,
    sowing_start_month: number,
    sowing_end_month: number,
    harvest_start_month: number,
    harvest_end_month: number,
    companion_crops: string[],
    incompatible_crops: string[],
    rotation_group: string,
    years_before_replant: number,
    common_pests: any,
    common_diseases: any,
    pest_resistance_level: string,
    nitrogen_fixer: boolean,
    attracts_pollinators: boolean,
    attracts_beneficial_insects: boolean,
    average_yield_kg_per_m2: number,
    harvest_type: string,
    preferred_moon_phase: string,
    biodynamic_type: string,
    description: string,
    growing_tips: string,
    culinary_uses: string,
    nutritional_info: any,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.name = name;
    this.scientific_name = scientific_name;
    this.family = family;
    this.category = category;
    this.lifecycle = lifecycle;
    this.growth_habit = growth_habit;
    this.days_to_harvest_min = days_to_harvest_min;
    this.days_to_harvest_max = days_to_harvest_max;
    this.days_to_maturity = days_to_maturity; // Asignación
    this.days_to_germination = days_to_germination;
    this.min_temperature_c = min_temperature_c;
    this.max_temperature_c = max_temperature_c;
    this.optimal_temperature_min_c = optimal_temperature_min_c;
    this.optimal_temperature_max_c = optimal_temperature_max_c;
    this.frost_tolerant = frost_tolerant;
    this.heat_tolerant = heat_tolerant;
    this.sun_requirement = sun_requirement;
    this.min_sun_hours = min_sun_hours;
    this.shade_tolerance = shade_tolerance;
    this.preferred_soil_types = preferred_soil_types;
    this.min_soil_ph = min_soil_ph;
    this.max_soil_ph = max_soil_ph;
    this.soil_depth_requirement = soil_depth_requirement;
    this.soil_fertility_requirement = soil_fertility_requirement;
    this.water_requirement = water_requirement;
    this.drought_tolerant = drought_tolerant;
    this.waterlogging_tolerant = waterlogging_tolerant;
    this.recommended_spacing_cm = recommended_spacing_cm;
    this.recommended_row_spacing_cm = recommended_row_spacing_cm;
    this.seed_depth_cm = seed_depth_cm;
    this.sowing_start_month = sowing_start_month;
    this.sowing_end_month = sowing_end_month;
    this.harvest_start_month = harvest_start_month;
    this.harvest_end_month = harvest_end_month;
    this.companion_crops = companion_crops;
    this.incompatible_crops = incompatible_crops;
    this.rotation_group = rotation_group;
    this.years_before_replant = years_before_replant;
    this.common_pests = common_pests;
    this.common_diseases = common_diseases;
    this.pest_resistance_level = pest_resistance_level;
    this.nitrogen_fixer = nitrogen_fixer;
    this.attracts_pollinators = attracts_pollinators;
    this.attracts_beneficial_insects = attracts_beneficial_insects;
    this.average_yield_kg_per_m2 = average_yield_kg_per_m2;
    this.harvest_type = harvest_type;
    this.preferred_moon_phase = preferred_moon_phase;
    this.biodynamic_type = biodynamic_type;
    this.description = description;
    this.growing_tips = growing_tips;
    this.culinary_uses = culinary_uses;
    this.nutritional_info = nutritional_info;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static from_persistence(raw: any): Crop {
    return new Crop(
      new CropId(raw.id),
      new CropName(raw.common_name),
      raw.scientific_name,
      raw.family,
      raw.category,
      raw.lifecycle,
      raw.growth_habit,
      raw.days_to_harvest_min,
      raw.days_to_harvest_max,
      raw.days_to_maturity, // Nuevo campo
      raw.days_to_germination,
      raw.min_temperature_c,
      raw.max_temperature_c,
      raw.optimal_temperature_min_c,
      raw.optimal_temperature_max_c,
      raw.frost_tolerant,
      raw.heat_tolerant,
      raw.sun_requirement,
      raw.min_sun_hours,
      raw.shade_tolerance,
      raw.preferred_soil_types || [],
      raw.min_soil_ph,
      raw.max_soil_ph,
      raw.soil_depth_requirement,
      raw.soil_fertility_requirement,
      raw.water_requirement,
      raw.drought_tolerant,
      raw.waterlogging_tolerant,
      raw.recommended_spacing_cm,
      raw.recommended_row_spacing_cm,
      raw.seed_depth_cm,
      raw.sowing_start_month,
      raw.sowing_end_month,
      raw.harvest_start_month,
      raw.harvest_end_month,
      raw.companion_crops || [],
      raw.incompatible_crops || [],
      raw.rotation_group,
      raw.years_before_replant,
      raw.common_pests,
      raw.common_diseases,
      raw.pest_resistance_level,
      raw.nitrogen_fixer,
      raw.attracts_pollinators,
      raw.attracts_beneficial_insects,
      raw.average_yield_kg_per_m2,
      raw.harvest_type,
      raw.preferred_moon_phase,
      raw.biodynamic_type,
      raw.description,
      raw.growing_tips,
      raw.culinary_uses,
      raw.nutritional_info,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      common_name: this.name.get_value(),
      scientific_name: this.scientific_name,
      family: this.family,
      category: this.category,
      lifecycle: this.lifecycle,
      growth_habit: this.growth_habit,
      days_to_harvest_min: this.days_to_harvest_min,
      days_to_harvest_max: this.days_to_harvest_max,
      days_to_maturity: this.days_to_maturity, // Nuevo campo
      days_to_germination: this.days_to_germination,
      min_temperature_c: this.min_temperature_c,
      max_temperature_c: this.max_temperature_c,
      optimal_temperature_min_c: this.optimal_temperature_min_c,
      optimal_temperature_max_c: this.optimal_temperature_max_c,
      frost_tolerant: this.frost_tolerant,
      heat_tolerant: this.heat_tolerant,
      sun_requirement: this.sun_requirement,
      min_sun_hours: this.min_sun_hours,
      shade_tolerance: this.shade_tolerance,
      preferred_soil_types: this.preferred_soil_types,
      min_soil_ph: this.min_soil_ph,
      max_soil_ph: this.max_soil_ph,
      soil_depth_requirement: this.soil_depth_requirement,
      soil_fertility_requirement: this.soil_fertility_requirement,
      water_requirement: this.water_requirement,
      drought_tolerant: this.drought_tolerant,
      waterlogging_tolerant: this.waterlogging_tolerant,
      recommended_spacing_cm: this.recommended_spacing_cm,
      recommended_row_spacing_cm: this.recommended_row_spacing_cm,
      seed_depth_cm: this.seed_depth_cm,
      sowing_start_month: this.sowing_start_month,
      sowing_end_month: this.sowing_end_month,
      harvest_start_month: this.harvest_start_month,
      harvest_end_month: this.harvest_end_month,
      companion_crops: this.companion_crops,
      incompatible_crops: this.incompatible_crops,
      rotation_group: this.rotation_group,
      years_before_replant: this.years_before_replant,
      common_pests: this.common_pests,
      common_diseases: this.common_diseases,
      pest_resistance_level: this.pest_resistance_level,
      nitrogen_fixer: this.nitrogen_fixer,
      attracts_pollinators: this.attracts_pollinators,
      attracts_beneficial_insects: this.attracts_beneficial_insects,
      average_yield_kg_per_m2: this.average_yield_kg_per_m2,
      harvest_type: this.harvest_type,
      preferred_moon_phase: this.preferred_moon_phase,
      biodynamic_type: this.biodynamic_type,
      description: this.description,
      growing_tips: this.growing_tips,
      culinary_uses: this.culinary_uses,
      nutritional_info: this.nutritional_info,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
