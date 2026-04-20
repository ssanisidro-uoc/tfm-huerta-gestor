import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export interface AssociationObservation {
  id: string;
  association_id: string;
  observed_by?: string;
  observation_date: Date;
  observation_type: string;
  outcome: string;
  effectiveness_rating?: number;
  description: string;
  photos?: any;
  measured_data?: any;
  created_at: Date;
  updated_at: Date;
}

export interface AssociationObservationWithNames extends AssociationObservation {
  primary_crop_name: string;
  companion_crop_name: string;
}

export class PostgresAssociationObservationsRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'association_observations';
  }

  async findByAssociationId(associationId: string): Promise<AssociationObservationWithNames[]> {
    const query = `
      SELECT 
        ao.*,
        pc1.crop_name as primary_crop_name,
        pc2.crop_name as companion_crop_name
      FROM association_observations ao
      JOIN planting_associations pa ON ao.association_id = pa.id
      JOIN plantings p1 ON pa.primary_planting_id = p1.id
      JOIN plantings p2 ON pa.companion_planting_id = p2.id
      JOIN crop_catalog pc1 ON p1.crop_catalog_id = pc1.id
      JOIN crop_catalog pc2 ON p2.crop_catalog_id = pc2.id
      WHERE ao.association_id = $1
      ORDER BY ao.observation_date DESC
    `;

    const result = await this.query<AssociationObservationWithNames>(query, [associationId]);
    return result.rows;
  }

  async findByPlotId(plotId: string): Promise<AssociationObservationWithNames[]> {
    const query = `
      SELECT 
        ao.*,
        pc1.crop_name as primary_crop_name,
        pc2.crop_name as companion_crop_name
      FROM association_observations ao
      JOIN planting_associations pa ON ao.association_id = pa.id
      JOIN plantings p1 ON pa.primary_planting_id = p1.id
      JOIN plantings p2 ON pa.companion_planting_id = p2.id
      JOIN crop_catalog pc1 ON p1.crop_catalog_id = pc1.id
      JOIN crop_catalog pc2 ON p2.crop_catalog_id = pc2.id
      WHERE p1.plot_id = $1 OR p2.plot_id = $1
      ORDER BY ao.observation_date DESC
    `;

    const result = await this.query<AssociationObservationWithNames>(query, [plotId]);
    return result.rows;
  }

  async create(observation: Partial<AssociationObservation>): Promise<AssociationObservation> {
    const query = `
      INSERT INTO association_observations (
        association_id, observed_by, observation_date,
        observation_type, outcome, effectiveness_rating,
        description, photos, measured_data,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.query<AssociationObservation>(query, [
      observation.association_id,
      observation.observed_by || null,
      observation.observation_date || new Date(),
      observation.observation_type,
      observation.outcome,
      observation.effectiveness_rating || null,
      observation.description,
      observation.photos ? JSON.stringify(observation.photos) : null,
      observation.measured_data ? JSON.stringify(observation.measured_data) : null
    ]);

    return result.rows[0];
  }

  async getReportByPlot(plotId: string): Promise<any> {
    const query = `
      SELECT 
        pa.primary_planting_id,
        pa.companion_planting_id,
        pc1.crop_name as primary_crop_name,
        pc2.crop_name as companion_crop_name,
        COUNT(ao.id) as observation_count,
        AVG(ao.effectiveness_rating) as avg_rating,
        mode() WITHIN GROUP (ORDER BY ao.outcome) as most_common_outcome
      FROM planting_associations pa
      JOIN plantings p1 ON pa.primary_planting_id = p1.id
      JOIN plantings p2 ON pa.companion_planting_id = p2.id
      JOIN crop_catalog pc1 ON p1.crop_catalog_id = pc1.id
      JOIN crop_catalog pc2 ON p2.crop_catalog_id = pc2.id
      LEFT JOIN association_observations ao ON ao.association_id = pa.id
      WHERE (p1.plot_id = $1 OR p2.plot_id = $1)
        AND pa.is_active = true
      GROUP BY pa.primary_planting_id, pa.companion_planting_id, pc1.crop_name, pc2.crop_name
      ORDER BY observation_count DESC, avg_rating DESC NULLS LAST
    `;

    const result = await this.query(query, [plotId]);
    return result.rows;
  }
}
