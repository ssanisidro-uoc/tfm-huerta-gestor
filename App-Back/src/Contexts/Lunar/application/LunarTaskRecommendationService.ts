import { Pool } from 'pg';

export interface CreateTaskRecommendationDTO {
  taskId: string;
  lunarCalendarId: string;
  lunarRuleId?: string;
  recommendationType: string;
  recommendationScore: number;
  urgencyLevel: string;
  recommendationTitle?: string;
  recommendationSummary?: string;
  detailedAdvice?: string;
}

export interface UpdateUserResponseDTO {
  userResponse: string;
  userNotes?: string;
}

export class LunarTaskRecommendationService {
  constructor(private pool: Pool) {}

  async createRecommendation(data: CreateTaskRecommendationDTO): Promise<any> {
    const query = `
      INSERT INTO lunar_task_recommendations (
        id, task_id, lunar_calendar_id, lunar_rule_id,
        recommendation_type, recommendation_score, urgency_level,
        recommendation_title, recommendation_summary, detailed_advice,
        created_at, updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      data.taskId,
      data.lunarCalendarId,
      data.lunarRuleId || null,
      data.recommendationType,
      data.recommendationScore,
      data.urgencyLevel,
      data.recommendationTitle || null,
      data.recommendationSummary || null,
      data.detailedAdvice || null
    ]);

    return result.rows[0];
  }

  async getRecommendationsByTaskId(taskId: string): Promise<any[]> {
    const query = `
      SELECT * FROM lunar_task_recommendations 
      WHERE task_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [taskId]);
    return result.rows;
  }

  async markAsShown(recommendationId: string): Promise<void> {
    const query = `
      UPDATE lunar_task_recommendations SET
        is_shown_to_user = true,
        shown_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `;
    await this.pool.query(query, [recommendationId]);
  }

  async updateUserResponse(recommendationId: string, data: UpdateUserResponseDTO): Promise<any> {
    const query = `
      UPDATE lunar_task_recommendations SET
        user_response = $2,
        user_response_at = NOW(),
        user_notes = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      recommendationId,
      data.userResponse,
      data.userNotes || null
    ]);

    return result.rows[0];
  }

  async getStatisticsForTask(taskId: string): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_shown_to_user = true) as shown,
        COUNT(*) FILTER (WHERE user_response = 'followed') as followed,
        COUNT(*) FILTER (WHERE user_response = 'ignored') as ignored,
        COUNT(*) FILTER (WHERE user_response = 'postponed') as postponed,
        COUNT(*) FILTER (WHERE user_response = 'dismissed') as dismissed,
        AVG(recommendation_score) as avg_score
      FROM lunar_task_recommendations
      WHERE task_id = $1
    `;
    
    const result = await this.pool.query(query, [taskId]);
    return result.rows[0];
  }

  async deleteRecommendation(recommendationId: string): Promise<void> {
    await this.pool.query('DELETE FROM lunar_task_recommendations WHERE id = $1', [recommendationId]);
  }
}