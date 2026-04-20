import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { CropCompatibilityId } from './CropCompatibilityId';

export type CompatibilityType = 
  | 'highly_beneficial'
  | 'beneficial'
  | 'neutral'
  | 'cautionary'
  | 'incompatible'
  | 'highly_incompatible';

export type SeverityLevel = 'minimal' | 'moderate' | 'severe' | 'critical';

export type PrimaryEffect = 
  | 'pest_repellent'
  | 'disease_resistance'
  | 'nutrient_enhancement'
  | 'pollinator_attractor'
  | 'shade_provider'
  | 'soil_improvement'
  | 'space_optimization'
  | 'growth_enhancer'
  | 'water_management'
  | 'competition'
  | 'allelopathy'
  | 'disease_host'
  | 'pest_attractor'
  | 'nutrient_competitor'
  | 'none';

export type EvidenceLevel = 
  | 'peer_reviewed'
  | 'field_trial'
  | 'observational'
  | 'traditional'
  | 'anecdotal'
  | 'theoretical';

export interface CropCompatibilityProps {
  id: string;
  crop_catalog_id: string;
  companion_crop_catalog_id: string;
  compatibility_type: CompatibilityType;
  compatibility_strength: number;
  severity_level: SeverityLevel | null;
  primary_effect: PrimaryEffect;
  secondary_effects: string[];
  mechanism: string | null;
  description: string | null;
  practical_tips: string | null;
  evidence_level: EvidenceLevel;
  source_type: string;
  source_references: string[];
  confidence_score: number | null;
  optimal_distance_cm: number | null;
  min_distance_cm: number | null;
  max_distance_cm: number | null;
  recommended_ratio: string | null;
  planting_arrangement: string | null;
  effective_growth_stages: string[];
  climate_zones_applicable: string[];
  season_dependency: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: Date | null;
  user_rating_avg: number | null;
  user_rating_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CropCompatibility extends AggregateRoot {
  readonly id: CropCompatibilityId;
  readonly crop_catalog_id: string;
  readonly companion_crop_catalog_id: string;
  readonly compatibility_type: CompatibilityType;
  readonly compatibility_strength: number;
  readonly severity_level: SeverityLevel | null;
  readonly primary_effect: PrimaryEffect;
  readonly secondary_effects: string[];
  readonly mechanism: string | null;
  readonly description: string | null;
  readonly practical_tips: string | null;
  readonly evidence_level: EvidenceLevel;
  readonly source_type: string;
  readonly source_references: string[];
  readonly confidence_score: number | null;
  readonly optimal_distance_cm: number | null;
  readonly min_distance_cm: number | null;
  readonly max_distance_cm: number | null;
  readonly recommended_ratio: string | null;
  readonly planting_arrangement: string | null;
  readonly effective_growth_stages: string[];
  readonly climate_zones_applicable: string[];
  readonly season_dependency: string | null;
  readonly is_verified: boolean;
  readonly verified_by: string | null;
  readonly verified_at: Date | null;
  readonly user_rating_avg: number | null;
  readonly user_rating_count: number;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(props: CropCompatibilityProps) {
    super();
    this.id = new CropCompatibilityId(props.id);
    this.crop_catalog_id = props.crop_catalog_id;
    this.companion_crop_catalog_id = props.companion_crop_catalog_id;
    this.compatibility_type = props.compatibility_type as CompatibilityType;
    this.compatibility_strength = props.compatibility_strength;
    this.severity_level = props.severity_level as SeverityLevel | null;
    this.primary_effect = props.primary_effect as PrimaryEffect;
    this.secondary_effects = props.secondary_effects || [];
    this.mechanism = props.mechanism;
    this.description = props.description;
    this.practical_tips = props.practical_tips;
    this.evidence_level = props.evidence_level as EvidenceLevel;
    this.source_type = props.source_type;
    this.source_references = props.source_references || [];
    this.confidence_score = props.confidence_score;
    this.optimal_distance_cm = props.optimal_distance_cm;
    this.min_distance_cm = props.min_distance_cm;
    this.max_distance_cm = props.max_distance_cm;
    this.recommended_ratio = props.recommended_ratio;
    this.planting_arrangement = props.planting_arrangement;
    this.effective_growth_stages = props.effective_growth_stages || [];
    this.climate_zones_applicable = props.climate_zones_applicable || [];
    this.season_dependency = props.season_dependency;
    this.is_verified = props.is_verified;
    this.verified_by = props.verified_by;
    this.verified_at = props.verified_at ? new Date(props.verified_at) : null;
    this.user_rating_avg = props.user_rating_avg;
    this.user_rating_count = props.user_rating_count;
    this.is_active = props.is_active;
    this.created_at = new Date(props.created_at);
    this.updated_at = new Date(props.updated_at);
  }

  static from_persistence(raw: CropCompatibilityProps): CropCompatibility {
    return new CropCompatibility(raw);
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      crop_catalog_id: this.crop_catalog_id,
      companion_crop_catalog_id: this.companion_crop_catalog_id,
      compatibility_type: this.compatibility_type,
      compatibility_strength: this.compatibility_strength,
      severity_level: this.severity_level,
      primary_effect: this.primary_effect,
      secondary_effects: this.secondary_effects,
      mechanism: this.mechanism,
      description: this.description,
      practical_tips: this.practical_tips,
      evidence_level: this.evidence_level,
      source_type: this.source_type,
      source_references: this.source_references,
      confidence_score: this.confidence_score,
      optimal_distance_cm: this.optimal_distance_cm,
      min_distance_cm: this.min_distance_cm,
      max_distance_cm: this.max_distance_cm,
      recommended_ratio: this.recommended_ratio,
      planting_arrangement: this.planting_arrangement,
      effective_growth_stages: this.effective_growth_stages,
      climate_zones_applicable: this.climate_zones_applicable,
      season_dependency: this.season_dependency,
      is_verified: this.is_verified,
      verified_by: this.verified_by,
      verified_at: this.verified_at,
      user_rating_avg: this.user_rating_avg,
      user_rating_count: this.user_rating_count,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  to_response(): any {
    return {
      id: this.id.get_value(),
      crop_catalog_id: this.crop_catalog_id,
      companion_crop_catalog_id: this.companion_crop_catalog_id,
      compatibility_type: this.compatibility_type,
      compatibility_strength: this.compatibility_strength,
      severity_level: this.severity_level,
      primary_effect: this.primary_effect,
      secondary_effects: this.secondary_effects,
      mechanism: this.mechanism,
      description: this.description,
      practical_tips: this.practical_tips,
      evidence_level: this.evidence_level,
      confidence_score: this.confidence_score,
      optimal_distance_cm: this.optimal_distance_cm,
      recommended_ratio: this.recommended_ratio,
      planting_arrangement: this.planting_arrangement,
      is_verified: this.is_verified
    };
  }

  isBeneficial(): boolean {
    return this.compatibility_type === 'highly_beneficial' || this.compatibility_type === 'beneficial';
  }

  isIncompatible(): boolean {
    return this.compatibility_type === 'incompatible' || this.compatibility_type === 'highly_incompatible';
  }
}