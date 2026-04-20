import { Pool } from 'pg';
import { LunarTaskRecommendation, LunarTaskRecommendationProps } from '../../domain/LunarTaskRecommendation/LunarTaskRecommendation';
import { LunarTaskRecommendationRepository } from '../../domain/LunarTaskRecommendation/LunarTaskRecommendationRepository';

export class PostgresLunarTaskRecommendationRepository implements LunarTaskRecommendationRepository {
  constructor(private pool: Pool) {}

  async findByTaskId(taskId: string): Promise<LunarTaskRecommendation[]> {
    const query = `
      SELECT * FROM lunar_task_recommendations 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [taskId]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findById(id: string): Promise<LunarTaskRecommendation | null> {
    const query = 'SELECT * FROM lunar_task_recommendations WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(result.rows[0]);
  }

  async save(recommendation: LunarTaskRecommendation): Promise<void> {
    const query = `
      INSERT INTO lunar_task_recommendations (
        id, task_id, lunar_calendar_id, lunar_rule_id,
        recommendation_type, recommendation_score, urgency_level,
        recommendation_title, recommendation_summary, detailed_advice,
        is_shown_to_user, shown_at, user_response, user_response_at, user_notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;

    await this.pool.query(query, [
      recommendation.id,
      recommendation.taskId,
      recommendation.lunarCalendarId,
      recommendation.lunarRuleId || null,
      recommendation.recommendationType,
      recommendation.recommendationScore,
      recommendation.urgencyLevel,
      recommendation.recommendationTitle || null,
      recommendation.recommendationSummary || null,
      recommendation.detailedAdvice || null,
      recommendation.isShownToUser,
      recommendation.shownAt || null,
      recommendation.userResponse || null,
      recommendation.userResponseAt || null,
      recommendation.userNotes || null,
      recommendation.createdAt,
      recommendation.updatedAt
    ]);
  }

  async update(recommendation: LunarTaskRecommendation): Promise<void> {
    const query = `
      UPDATE lunar_task_recommendations SET
        is_shown_to_user = $2,
        shown_at = $3,
        user_response = $4,
        user_response_at = $5,
        user_notes = $6,
        updated_at = $7
      WHERE id = $1
    `;

    await this.pool.query(query, [
      recommendation.id,
      recommendation.isShownToUser,
      recommendation.shownAt || null,
      recommendation.userResponse || null,
      recommendation.userResponseAt || null,
      recommendation.userNotes || null,
      new Date()
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM lunar_task_recommendations WHERE id = $1', [id]);
  }

  async getStatisticsForTask(taskId: string): Promise<{
    total: number;
    shown: number;
    followed: number;
    ignored: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_shown_to_user = true) as shown,
        COUNT(*) FILTER (WHERE user_response = 'followed') as followed,
        COUNT(*) FILTER (WHERE user_response = 'ignored') as ignored
      FROM lunar_task_recommendations
      WHERE task_id = $1
    `;
    
    const result = await this.pool.query(query, [taskId]);
    const row = result.rows[0];

    return {
      total: parseInt(row.total) || 0,
      shown: parseInt(row.shown) || 0,
      followed: parseInt(row.followed) || 0,
      ignored: parseInt(row.ignored) || 0
    };
  }

  private mapRowToEntity(row: any): LunarTaskRecommendation {
    const props: LunarTaskRecommendationProps = {
      id: row.id,
      taskId: row.task_id,
      lunarCalendarId: row.lunar_calendar_id,
      lunarRuleId: row.lunar_rule_id,
      recommendationType: row.recommendation_type,
      recommendationScore: row.recommendation_score,
      urgencyLevel: row.urgency_level,
      recommendationTitle: row.recommendation_title,
      recommendationSummary: row.recommendation_summary,
      detailedAdvice: row.detailed_advice,
      isShownToUser: row.is_shown_to_user,
      shownAt: row.shown_at,
      userResponse: row.user_response,
      userResponseAt: row.user_response_at,
      userNotes: row.user_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    return new LunarTaskRecommendation(props);
  }
}