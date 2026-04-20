import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';

export interface LunarTaskRecommendationProps {
  id?: string;
  taskId: string;
  lunarCalendarId: string;
  lunarRuleId?: string;
  recommendationType: string;
  recommendationScore: number;
  urgencyLevel: string;
  recommendationTitle?: string;
  recommendationSummary?: string;
  detailedAdvice?: string;
  isShownToUser?: boolean;
  shownAt?: Date;
  userResponse?: string;
  userResponseAt?: Date;
  userNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LunarTaskRecommendation extends AggregateRoot {
  readonly id: string;
  readonly taskId: string;
  readonly lunarCalendarId: string;
  readonly lunarRuleId?: string;
  readonly recommendationType: string;
  readonly recommendationScore: number;
  readonly urgencyLevel: string;
  readonly recommendationTitle?: string;
  readonly recommendationSummary?: string;
  readonly detailedAdvice?: string;
  isShownToUser: boolean;
  shownAt?: Date;
  userResponse?: string;
  userResponseAt?: Date;
  userNotes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LunarTaskRecommendationProps) {
    super();
    this.id = props.id || crypto.randomUUID();
    this.taskId = props.taskId;
    this.lunarCalendarId = props.lunarCalendarId;
    this.lunarRuleId = props.lunarRuleId;
    this.recommendationType = props.recommendationType;
    this.recommendationScore = props.recommendationScore;
    this.urgencyLevel = props.urgencyLevel;
    this.recommendationTitle = props.recommendationTitle;
    this.recommendationSummary = props.recommendationSummary;
    this.detailedAdvice = props.detailedAdvice;
    this.isShownToUser = props.isShownToUser || false;
    this.shownAt = props.shownAt;
    this.userResponse = props.userResponse;
    this.userResponseAt = props.userResponseAt;
    this.userNotes = props.userNotes;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  markAsShown(): void {
    this.isShownToUser = true;
    this.shownAt = new Date();
  }

  setUserResponse(response: string, notes?: string): void {
    this.userResponse = response;
    this.userResponseAt = new Date();
    if (notes) {
      this.userNotes = notes;
    }
  }

  toPrimitives() {
    return {
      id: this.id,
      taskId: this.taskId,
      lunarCalendarId: this.lunarCalendarId,
      lunarRuleId: this.lunarRuleId,
      recommendationType: this.recommendationType,
      recommendationScore: this.recommendationScore,
      urgencyLevel: this.urgencyLevel,
      recommendationTitle: this.recommendationTitle,
      recommendationSummary: this.recommendationSummary,
      detailedAdvice: this.detailedAdvice,
      isShownToUser: this.isShownToUser,
      shownAt: this.shownAt?.toISOString(),
      userResponse: this.userResponse,
      userResponseAt: this.userResponseAt?.toISOString(),
      userNotes: this.userNotes
    };
  }
}