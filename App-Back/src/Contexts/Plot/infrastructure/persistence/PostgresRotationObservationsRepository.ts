import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export interface RotationObservation {
  id: string;
  rotation_plan_id?: string;
  previous_planting_id?: string;
  current_planting_id: string;
  rotation_rule_id?: string;
  observed_by?: string;
  observation_date: Date;
  observed_outcome: string;
  effectiveness_rating?: number;
  soil_condition?: string;
  pest_pressure?: string;
  disease_incidence?: string;
  yield_compared_to_expected?: string;
  description: string;
  would_repeat?: boolean;
  created_at: Date;
}

export class RotationObservationsRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'rotation_observations';
  }

  async create(observation: Partial<RotationObservation>): Promise<RotationObservation> {
    const query = `
      INSERT INTO rotation_observations (
        previous_planting_id, current_planting_id, rotation_rule_id,
        observed_by, observation_date, observed_outcome, description,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.query<RotationObservation>(query, [
      observation.previous_planting_id,
      observation.current_planting_id,
      observation.rotation_rule_id,
      observation.observed_by,
      observation.observation_date,
      observation.observed_outcome,
      observation.description
    ]);

    return result.rows[0];
  }

  async findByPlotId(plotId: string): Promise<RotationObservation[]> {
    const query = `
      SELECT ro.*, 
             pc.crop_name as previous_crop_name,
             cc.crop_name as current_crop_name
      FROM rotation_observations ro
      JOIN plantings p ON ro.current_planting_id = p.id
      LEFT JOIN crop_catalog pc ON pc.id = (SELECT crop_id FROM plantings WHERE id = ro.previous_planting_id)
      LEFT JOIN crop_catalog cc ON cc.id = p.crop_catalog_id
      WHERE p.plot_id = $1
      ORDER BY ro.observation_date DESC
    `;

    const result = await this.query<RotationObservation>(query, [plotId]);
    return result.rows;
  }
}
