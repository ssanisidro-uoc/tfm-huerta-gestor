import { Pool } from 'pg';
import { logger } from '../../Shared/infrastructure/Logger';

export interface WeatherObservation {
  id: string;
  weather_alert_id?: string;
  garden_id: string;
  planting_id?: string;
  task_id?: string;
  observed_by?: string;
  observation_date: Date;
  action_taken: boolean;
  action_type?: string;
  observed_outcome: string;
  damage_occurred: boolean;
  damage_severity?: string;
  damage_description?: string;
  notes?: string;
  created_at: Date;
}

export class WeatherObservationsRepository {
  constructor(private pool: Pool) {}

  async create(observation: Partial<WeatherObservation>): Promise<WeatherObservation> {
    const query = `
      INSERT INTO weather_observations (
        weather_alert_id, garden_id, planting_id, task_id, observed_by,
        observation_date, action_taken, action_type, observed_outcome,
        damage_occurred, damage_severity, damage_description, notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      observation.weather_alert_id, observation.garden_id, observation.planting_id,
      observation.task_id, observation.observed_by, observation.observation_date,
      observation.action_taken, observation.action_type, observation.observed_outcome,
      observation.damage_occurred, observation.damage_severity, observation.damage_description,
      observation.notes
    ]);

    return result.rows[0];
  }

  async findByGarden(gardenId: string, limit: number = 50): Promise<WeatherObservation[]> {
    const query = `
      SELECT * FROM weather_observations 
      WHERE garden_id = $1
      ORDER BY observation_date DESC
      LIMIT $2
    `;
    const result = await this.pool.query(query, [gardenId, limit]);
    return result.rows;
  }

  async findByAlert(alertId: string): Promise<WeatherObservation[]> {
    const query = `
      SELECT * FROM weather_observations 
      WHERE weather_alert_id = $1
      ORDER BY observation_date DESC
    `;
    const result = await this.pool.query(query, [alertId]);
    return result.rows;
  }
}

export class WeatherApiRequestsRepository {
  constructor(private pool: Pool) {}

  async logRequest(request: {
    weatherLocationId: string;
    requestType: string;
    requestUrl: string;
    apiProvider: string;
    responseStatusCode: number;
    responseTimeMs: number;
    wasSuccessful: boolean;
    dataPointsReturned?: number;
    errorMessage?: string;
  }): Promise<void> {
    const query = `
      INSERT INTO weather_api_requests (
        weather_location_id, request_type, request_url, api_provider,
        response_status_code, response_time_ms, was_successful,
        data_points_returned, error_message, requested_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    await this.pool.query(query, [
      request.weatherLocationId, request.requestType, request.requestUrl,
      request.apiProvider, request.responseStatusCode, request.responseTimeMs,
      request.wasSuccessful, request.dataPointsReturned, request.errorMessage
    ]);
  }

  async getUsageStats(locationId?: string, days: number = 30): Promise<any> {
    const query = `
      SELECT 
        api_provider,
        request_type,
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        SUM(CASE WHEN was_successful THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN NOT was_successful THEN 1 ELSE 0 END) as failed_requests
      FROM weather_api_requests
      WHERE requested_at > NOW() - INTERVAL '${days} days'
        ${locationId ? 'AND weather_location_id = $1' : ''}
      GROUP BY api_provider, request_type
      ORDER BY total_requests DESC
    `;

    const result = locationId 
      ? await this.pool.query(query, [locationId])
      : await this.pool.query(query);
    
    return result.rows;
  }
}
