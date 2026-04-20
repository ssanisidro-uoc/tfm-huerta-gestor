import { Pool } from 'pg';
import { LunarObservation, LunarObservationProps } from '../../domain/LunarObservation/LunarObservation';
import { LunarObservationRepository } from '../../domain/LunarObservation/LunarObservationRepository';

export class PostgresLunarObservationRepository implements LunarObservationRepository {
  constructor(private pool: Pool) {}

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<LunarObservation[]> {
    const query = `
      SELECT * FROM lunar_observations 
      WHERE user_id = $1 
      ORDER BY observation_date DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.pool.query(query, [userId, limit, offset]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByTaskId(taskId: string): Promise<LunarObservation[]> {
    const query = 'SELECT * FROM lunar_observations WHERE task_id = $1 ORDER BY observation_date DESC';
    const result = await this.pool.query(query, [taskId]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByPlantingId(plantingId: string): Promise<LunarObservation[]> {
    const query = 'SELECT * FROM lunar_observations WHERE planting_id = $1 ORDER BY observation_date DESC';
    const result = await this.pool.query(query, [plantingId]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findById(id: string): Promise<LunarObservation | null> {
    const query = 'SELECT * FROM lunar_observations WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  async save(observation: LunarObservation): Promise<void> {
    const query = `
      INSERT INTO lunar_observations (
        id, user_id, task_id, planting_id, lunar_calendar_id, lunar_rule_id,
        lunar_recommendation_id, observation_type, observation_date, agricultural_action,
        followed_lunar_advice, lunar_advice_followed, actual_outcome, expected_outcome,
        outcome_rating, crop_result, notes, weather_conditions, soil_conditions,
        confidence_in_lunar_effect, alternative_explanation, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    `;

    await this.pool.query(query, [
      observation.id,
      observation.userId,
      observation.taskId || null,
      observation.plantingId || null,
      observation.lunarCalendarId,
      observation.lunarRuleId || null,
      observation.lunarRecommendationId || null,
      observation.observationType,
      observation.observationDate,
      observation.agriculturalAction,
      observation.followedLunarAdvice,
      observation.lunarAdviceFollowed || null,
      observation.actualOutcome || null,
      observation.expectedOutcome || null,
      observation.outcomeRating || null,
      observation.cropResult || null,
      observation.notes || null,
      observation.weatherConditions || null,
      observation.soilConditions || null,
      observation.confidenceInLunarEffect || null,
      observation.alternativeExplanation || null,
      observation.createdAt,
      observation.updatedAt
    ]);
  }

  async update(observation: LunarObservation): Promise<void> {
    const query = `
      UPDATE lunar_observations SET
        actual_outcome = $2,
        outcome_rating = $3,
        notes = $4,
        confidence_in_lunar_effect = $5,
        alternative_explanation = $6,
        updated_at = $7
      WHERE id = $1
    `;

    await this.pool.query(query, [
      observation.id,
      observation.actualOutcome || null,
      observation.outcomeRating || null,
      observation.notes || null,
      observation.confidenceInLunarEffect || null,
      observation.alternativeExplanation || null,
      new Date()
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM lunar_observations WHERE id = $1', [id]);
  }

  async getUserStatistics(userId: string): Promise<{
    totalObservations: number;
    followedAdvice: number;
    ignoredAdvice: number;
    averageOutcomeRating: number;
    averageConfidence: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE followed_lunar_advice = true) as followed,
        COUNT(*) FILTER (WHERE followed_lunar_advice = false) as ignored,
        AVG(outcome_rating) as avg_rating,
        AVG(confidence_in_lunar_effect) as avg_confidence
      FROM lunar_observations
      WHERE user_id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    const row = result.rows[0];

    return {
      totalObservations: parseInt(row.total) || 0,
      followedAdvice: parseInt(row.followed) || 0,
      ignoredAdvice: parseInt(row.ignored) || 0,
      averageOutcomeRating: parseFloat(row.avg_rating) || 0,
      averageConfidence: parseFloat(row.avg_confidence) || 0
    };
  }

  private mapRowToEntity(row: any): LunarObservation {
    const props: LunarObservationProps = {
      id: row.id,
      userId: row.user_id,
      taskId: row.task_id,
      plantingId: row.planting_id,
      lunarCalendarId: row.lunar_calendar_id,
      lunarRuleId: row.lunar_rule_id,
      lunarRecommendationId: row.lunar_recommendation_id,
      observationType: row.observation_type,
      observationDate: row.observation_date,
      agriculturalAction: row.agricultural_action,
      followedLunarAdvice: row.followed_lunar_advice,
      lunarAdviceFollowed: row.lunar_advice_followed,
      actualOutcome: row.actual_outcome,
      expectedOutcome: row.expected_outcome,
      outcomeRating: row.outcome_rating,
      cropResult: row.crop_result,
      notes: row.notes,
      weatherConditions: row.weather_conditions,
      soilConditions: row.soil_conditions,
      confidenceInLunarEffect: row.confidence_in_lunar_effect,
      alternativeExplanation: row.alternative_explanation,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return new LunarObservation(props);
  }
}