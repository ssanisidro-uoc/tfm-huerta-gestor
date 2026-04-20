import { Pool } from 'pg';
import { PostgresLunarAgriculturalRuleRepository } from '../infrastructure/persistence/PostgresLunarAgriculturalRuleRepository';
import { LunarCalculationService, MoonPhaseData } from './LunarCalculationService';

export interface TodayLunarData {
  date: string;
  moonPhase: string;
  moonPhaseEmoji: string;
  illuminationPercent: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isFirstQuarter: boolean;
  isLastQuarter: boolean;
  zodiacSign: string;
  zodiacElement: string;
  biodynamicDayType: string;
  biodynamicQuality: string;
  isPerigee: boolean;
  isApogee: boolean;
}

export interface LunarRecommendation {
  id: string;
  title: string;
  description: string;
  agriculturalAction: string;
  cropPart: string | null;
  recommendationType: string;
  recommendationStrength: number;
  urgencyLevel: string;
  evidenceLevel: string;
}

export class LunarService {
  private pool: Promise<Pool>;
  private calculationService: LunarCalculationService;

  constructor(pool: Promise<Pool>) {
    this.pool = pool;
    this.calculationService = new LunarCalculationService(pool);
  }

  async getTodayLunar(hemisphere: string): Promise<TodayLunarData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const moonData = await this.calculationService.getByDate(today, hemisphere);
    
    return this.mapToTodayLunar(moonData);
  }

  async getMoonDataForDate(date: Date, hemisphere: string = 'northern'): Promise<TodayLunarData> {
    date.setHours(0, 0, 0, 0);
    const moonData = await this.calculationService.getByDate(date, hemisphere);
    return this.mapToTodayLunar(moonData);
  }

  async getRecommendationsForTask(
    taskId: string,
    taskType: string,
    hemisphere: string
  ): Promise<LunarRecommendation[]> {
    const pool = await this.pool;
    
    const query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE is_active = true 
        AND (agricultural_action = $1 OR $1 = ANY(string_to_array(agricultural_action, ',')))
      ORDER BY recommendation_strength DESC
      LIMIT 10
    `;
    const result = await pool.query(query, [taskType]);

    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      agriculturalAction: row.agricultural_action,
      cropPart: row.crop_part || null,
      recommendationType: row.recommendation_type,
      recommendationStrength: row.recommendation_strength,
      urgencyLevel: row.urgency_level,
      evidenceLevel: row.evidence_level
    }));
  }

  private mapToTodayLunar(data: MoonPhaseData): TodayLunarData {
    return {
      date: data.date.toISOString().split('T')[0],
      moonPhase: data.moonPhase,
      moonPhaseEmoji: this.getPhaseEmoji(data.moonPhase),
      illuminationPercent: data.illuminationPercent,
      isNewMoon: data.isNewMoon,
      isFullMoon: data.isFullMoon,
      isFirstQuarter: data.isFirstQuarter,
      isLastQuarter: data.isLastQuarter,
      zodiacSign: data.zodiacSign,
      zodiacElement: data.zodiacElement,
      biodynamicDayType: data.biodynamicDayType,
      biodynamicQuality: data.biodynamicQuality,
      isPerigee: data.isPerigee,
      isApogee: data.isPerigee ? false : false
    };
  }

  private getPhaseEmoji(moonPhase: string): string {
    const phaseMap: Record<string, string> = {
      'new_moon': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full_moon': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    };
    return phaseMap[moonPhase] || '🌙';
  }
}