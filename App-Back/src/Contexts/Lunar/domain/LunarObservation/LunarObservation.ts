import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';

export interface LunarObservationProps {
  id?: string;
  userId: string;
  taskId?: string;
  plantingId?: string;
  lunarCalendarId: string;
  lunarRuleId?: string;
  lunarRecommendationId?: string;
  observationType: string;
  observationDate: Date;
  agriculturalAction: string;
  followedLunarAdvice: boolean;
  lunarAdviceFollowed?: string;
  actualOutcome?: string;
  expectedOutcome?: string;
  outcomeRating?: number;
  cropResult?: string;
  notes?: string;
  weatherConditions?: string;
  soilConditions?: string;
  confidenceInLunarEffect?: number;
  alternativeExplanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LunarObservation extends AggregateRoot {
  readonly id: string;
  readonly userId: string;
  readonly taskId?: string;
  readonly plantingId?: string;
  readonly lunarCalendarId: string;
  readonly lunarRuleId?: string;
  readonly lunarRecommendationId?: string;
  readonly observationType: string;
  readonly observationDate: Date;
  readonly agriculturalAction: string;
  followedLunarAdvice: boolean;
  lunarAdviceFollowed?: string;
  actualOutcome?: string;
  expectedOutcome?: string;
  outcomeRating?: number;
  cropResult?: string;
  notes?: string;
  weatherConditions?: string;
  soilConditions?: string;
  confidenceInLunarEffect?: number;
  alternativeExplanation?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LunarObservationProps) {
    super();
    this.id = props.id || crypto.randomUUID();
    this.userId = props.userId;
    this.taskId = props.taskId;
    this.plantingId = props.plantingId;
    this.lunarCalendarId = props.lunarCalendarId;
    this.lunarRuleId = props.lunarRuleId;
    this.lunarRecommendationId = props.lunarRecommendationId;
    this.observationType = props.observationType;
    this.observationDate = props.observationDate;
    this.agriculturalAction = props.agriculturalAction;
    this.followedLunarAdvice = props.followedLunarAdvice;
    this.lunarAdviceFollowed = props.lunarAdviceFollowed;
    this.actualOutcome = props.actualOutcome;
    this.expectedOutcome = props.expectedOutcome;
    this.outcomeRating = props.outcomeRating;
    this.cropResult = props.cropResult;
    this.notes = props.notes;
    this.weatherConditions = props.weatherConditions;
    this.soilConditions = props.soilConditions;
    this.confidenceInLunarEffect = props.confidenceInLunarEffect;
    this.alternativeExplanation = props.alternativeExplanation;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  updateOutcome(outcome: string, rating: number): void {
    this.actualOutcome = outcome;
    this.outcomeRating = rating;
  }

  setNotes(notes: string): void {
    this.notes = notes;
  }

  toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      taskId: this.taskId,
      plantingId: this.plantingId,
      lunarCalendarId: this.lunarCalendarId,
      lunarRuleId: this.lunarRuleId,
      lunarRecommendationId: this.lunarRecommendationId,
      observationType: this.observationType,
      observationDate: this.observationDate.toISOString(),
      agriculturalAction: this.agriculturalAction,
      followedLunarAdvice: this.followedLunarAdvice,
      lunarAdviceFollowed: this.lunarAdviceFollowed,
      actualOutcome: this.actualOutcome,
      expectedOutcome: this.expectedOutcome,
      outcomeRating: this.outcomeRating,
      cropResult: this.cropResult,
      notes: this.notes,
      weatherConditions: this.weatherConditions,
      soilConditions: this.soilConditions,
      confidenceInLunarEffect: this.confidenceInLunarEffect,
      alternativeExplanation: this.alternativeExplanation
    };
  }
}