import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';

export interface LunarAgriculturalRuleProps {
  id?: string;
  moonPhase?: string;
  moonPhaseRangeMin?: number;
  moonPhaseRangeMax?: number;
  zodiacSign?: string;
  zodiacElement?: string;
  biodynamicDayType?: string;
  appliesToPerigee: boolean;
  appliesToApogee: boolean;
  appliesToEclipse: boolean;
  agriculturalAction: string;
  cropCatalogId?: string;
  cropCategory?: string;
  cropPart?: string;
  recommendationType: string;
  recommendationStrength: number;
  urgencyLevel: string;
  title: string;
  description: string;
  practicalAdvice?: string;
  traditionalSaying?: string;
  mechanismClaimed?: string;
  scientificBasis?: string;
  evidenceLevel: string;
  confidenceScore?: number;
  climateZonesApplicable?: string[];
  hemisphereApplicable?: string;
  seasonApplicable?: string;
  isActive: boolean;
}

export class LunarAgriculturalRule extends AggregateRoot {
  readonly id: string;
  readonly moonPhase: string;
  readonly moonPhaseRangeMin: number;
  readonly moonPhaseRangeMax: number;
  readonly zodiacSign: string;
  readonly zodiacElement: string;
  readonly biodynamicDayType: string;
  readonly appliesToPerigee: boolean;
  readonly appliesToApogee: boolean;
  readonly appliesToEclipse: boolean;
  readonly agriculturalAction: string;
  readonly cropCatalogId: string;
  readonly cropCategory: string;
  readonly cropPart: string;
  readonly recommendationType: string;
  readonly recommendationStrength: number;
  readonly urgencyLevel: string;
  readonly title: string;
  readonly description: string;
  readonly practicalAdvice: string;
  readonly traditionalSaying: string;
  readonly mechanismClaimed: string;
  readonly scientificBasis: string;
  readonly evidenceLevel: string;
  readonly confidenceScore: number;
  readonly climateZonesApplicable: string[];
  readonly hemisphereApplicable: string;
  readonly seasonApplicable: string;

  constructor(props: LunarAgriculturalRuleProps) {
    super();
    this.id = props.id || crypto.randomUUID();
    this.moonPhase = props.moonPhase || '';
    this.moonPhaseRangeMin = props.moonPhaseRangeMin || 0;
    this.moonPhaseRangeMax = props.moonPhaseRangeMax || 1;
    this.zodiacSign = props.zodiacSign || '';
    this.zodiacElement = props.zodiacElement || '';
    this.biodynamicDayType = props.biodynamicDayType || '';
    this.appliesToPerigee = props.appliesToPerigee || false;
    this.appliesToApogee = props.appliesToApogee || false;
    this.appliesToEclipse = props.appliesToEclipse || false;
    this.agriculturalAction = props.agriculturalAction;
    this.cropCatalogId = props.cropCatalogId || '';
    this.cropCategory = props.cropCategory || '';
    this.cropPart = props.cropPart || '';
    this.recommendationType = props.recommendationType;
    this.recommendationStrength = props.recommendationStrength;
    this.urgencyLevel = props.urgencyLevel || 'suggestion';
    this.title = props.title;
    this.description = props.description;
    this.practicalAdvice = props.practicalAdvice || '';
    this.traditionalSaying = props.traditionalSaying || '';
    this.mechanismClaimed = props.mechanismClaimed || '';
    this.scientificBasis = props.scientificBasis || '';
    this.evidenceLevel = props.evidenceLevel || 'traditional';
    this.confidenceScore = props.confidenceScore || 5;
    this.climateZonesApplicable = props.climateZonesApplicable || [];
    this.hemisphereApplicable = props.hemisphereApplicable || 'both';
    this.seasonApplicable = props.seasonApplicable || '';
  }

  static readonly ACTIONS = {
    SOW: 'sow',
    TRANSPLANT: 'transplant',
    HARVEST: 'harvest',
    PRUNE: 'prune',
    FERTILIZE: 'fertilize',
    WATER: 'water',
    PEST_CONTROL: 'pest_control',
    SOIL_WORK: 'soil_work',
    GRAFT: 'graft',
    CUTTINGS: 'cuttings'
  };

  static readonly RECOMMENDATIONS = {
    HIGHLY_FAVORABLE: 'highly_favorable',
    FAVORABLE: 'favorable',
    NEUTRAL: 'neutral',
    UNFAVORABLE: 'unfavorable',
    HIGHLY_UNFAVORABLE: 'highly_unfavorable'
  };

  static readonly CROP_PARTS = {
    ROOT: 'root',
    LEAF: 'leaf',
    FLOWER: 'flower',
    FRUIT: 'fruit',
    SEED: 'seed'
  };

  isFavorable(): boolean {
    return this.recommendationStrength >= 5;
  }

  isUnfavorable(): boolean {
    return this.recommendationStrength <= -5;
  }

  appliesTo(action: string, cropPart?: string): boolean {
    const actionMatch = this.agriculturalAction === action || this.agriculturalAction === 'all';
    const partMatch = !cropPart || this.cropPart === cropPart || this.cropPart === 'all';
    return actionMatch && partMatch;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      moon_phase: this.moonPhase,
      moon_phase_range_min: this.moonPhaseRangeMin,
      moon_phase_range_max: this.moonPhaseRangeMax,
      zodiac_sign: this.zodiacSign,
      zodiac_element: this.zodiacElement,
      biodynamic_day_type: this.biodynamicDayType,
      applies_to_perigee: this.appliesToPerigee,
      applies_to_apogee: this.appliesToApogee,
      agricultural_action: this.agriculturalAction,
      crop_catalog_id: this.cropCatalogId,
      crop_category: this.cropCategory,
      crop_part: this.cropPart,
      recommendation_type: this.recommendationType,
      recommendation_strength: this.recommendationStrength,
      urgency_level: this.urgencyLevel,
      title: this.title,
      description: this.description,
      practical_advice: this.practicalAdvice,
      traditional_saying: this.traditionalSaying,
      mechanism_claimed: this.mechanismClaimed,
      evidence_level: this.evidenceLevel,
      confidence_score: this.confidenceScore
    };
  }
}