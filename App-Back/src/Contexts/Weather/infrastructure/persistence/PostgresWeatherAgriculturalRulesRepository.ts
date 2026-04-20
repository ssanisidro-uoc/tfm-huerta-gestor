import { Pool } from 'pg';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';

export interface WeatherAgriculturalRule {
  id: string;
  agriculturalAction: string;
  recommendationType: string;
  conditionType: string;
  tempMin: number | null;
  tempMax: number | null;
  humidityMin: number | null;
  humidityMax: number | null;
  precipitationMin: number | null;
  precipitationMax: number | null;
  windSpeedMax: number | null;
  recommendationStrength: number;
  urgencyLevel: string;
  description: string;
}

export class WeatherAgriculturalRulesRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'weather_agricultural_rules';
  }

  async findRulesForConditions(
    tempAvg: number,
    humidityAvg: number,
    precipitationSum: number
  ): Promise<WeatherAgriculturalRule[]> {
    const query = `
      SELECT 
        id,
        agricultural_action as agricultural_action,
        recommendation_type as recommendation_type,
        condition_type as condition_type,
        temp_min as temp_min,
        temp_max as temp_max,
        humidity_min as humidity_min,
        humidity_max as humidity_max,
        precipitation_min as precipitation_min,
        precipitation_max as precipitation_max,
        wind_speed_max as wind_speed_max,
        recommendation_strength as recommendation_strength,
        urgency_level as urgency_level,
        description as description
      FROM weather_agricultural_rules
      WHERE is_active = true
        AND (temp_min IS NULL OR temp_min <= $1)
        AND (temp_max IS NULL OR temp_max >= $1)
        AND (humidity_min IS NULL OR humidity_min <= $2)
        AND (humidity_max IS NULL OR humidity_max >= $2)
        AND (precipitation_min IS NULL OR precipitation_min <= $3)
        AND (precipitation_max IS NULL OR precipitation_max >= $3)
      ORDER BY recommendation_strength DESC
      LIMIT 10
    `;

    const result = await this.query<any>(query, [tempAvg, humidityAvg, precipitationSum]);
    return result.rows;
  }

  async findRulesByAction(action: string): Promise<WeatherAgriculturalRule[]> {
    const query = `
      SELECT 
        id,
        agricultural_action as agricultural_action,
        recommendation_type as recommendation_type,
        condition_type as condition_type,
        temp_min as temp_min,
        temp_max as temp_max,
        humidity_min as humidity_min,
        humidity_max as humidity_max,
        precipitation_min as precipitation_min,
        precipitation_max as precipitation_max,
        wind_speed_max as wind_speed_max,
        recommendation_strength as recommendation_strength,
        urgency_level as urgency_level,
        description as description
      FROM weather_agricultural_rules
      WHERE is_active = true AND agricultural_action = $1
      ORDER BY recommendation_strength DESC
    `;

    const result = await this.query<any>(query, [action]);
    return result.rows;
  }

  async findAllRules(page = 1, limit = 50): Promise<{ rules: WeatherAgriculturalRule[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM weather_agricultural_rules WHERE is_active = true`;
    const countResult = await this.query<any>(countQuery, []);
    const total = parseInt(countResult.rows[0].total, 10);

    const query = `
      SELECT 
        id,
        agricultural_action as agricultural_action,
        recommendation_type as recommendation_type,
        condition_type as condition_type,
        temp_min as temp_min,
        temp_max as temp_max,
        humidity_min as humidity_min,
        humidity_max as humidity_max,
        precipitation_min as precipitation_min,
        precipitation_max as precipitation_max,
        wind_speed_max as wind_speed_max,
        recommendation_strength as recommendation_strength,
        urgency_level as urgency_level,
        description as description
      FROM weather_agricultural_rules
      WHERE is_active = true
      ORDER BY recommendation_strength DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.query<any>(query, [limit, offset]);
    return { rules: result.rows, total };
  }
}
