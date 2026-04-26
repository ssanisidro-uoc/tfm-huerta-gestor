import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export interface PlantingAssociation {
  id: string;
  primary_planting_id: string;
  companion_planting_id: string;
  compatibility_id?: string;
  actual_distance_cm?: number;
  actual_arrangement?: string;
  actual_ratio?: string;
  association_started: Date;
  association_ended?: Date;
  purpose?: string;
  expected_benefit?: string;
  user_notes?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlantingAssociationWithNames extends PlantingAssociation {
  primary_crop_name: string;
  companion_crop_name: string;
}

export class PostgresPlantingAssociationsRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'planting_associations';
  }

  async findByPlantingId(plantingId: string): Promise<PlantingAssociationWithNames[]> {
    const query = `
      SELECT 
        pa.*,
        pc1.common_name as primary_crop_name,
        pc2.common_name as companion_crop_name
      FROM planting_associations pa
      JOIN plantings p1 ON pa.primary_planting_id = p1.id
      JOIN plantings p2 ON pa.companion_planting_id = p2.id
      JOIN crop_catalog pc1 ON p1.crop_catalog_id = pc1.id
      JOIN crop_catalog pc2 ON p2.crop_catalog_id = pc2.id
      WHERE (pa.primary_planting_id = $1 OR pa.companion_planting_id = $1)
        AND pa.is_active = true
      ORDER BY pa.created_at DESC
    `;

    const result = await this.query<PlantingAssociationWithNames>(query, [plantingId]);
    return result.rows;
  }

  async findByPlotId(plotId: string): Promise<PlantingAssociationWithNames[]> {
    const query = `
      SELECT 
        pa.*,
        pc1.common_name as primary_crop_name,
        pc2.common_name as companion_crop_name
      FROM planting_associations pa
      JOIN plantings p1 ON pa.primary_planting_id = p1.id
      JOIN plantings p2 ON pa.companion_planting_id = p2.id
      JOIN crop_catalog pc1 ON p1.crop_catalog_id = pc1.id
      JOIN crop_catalog pc2 ON p2.crop_catalog_id = pc2.id
      WHERE p1.plot_id = $1 OR p2.plot_id = $1
        AND pa.is_active = true
      ORDER BY pa.association_started DESC
    `;

    const result = await this.query<PlantingAssociationWithNames>(query, [plotId]);
    return result.rows;
  }

  async findById(id: string): Promise<PlantingAssociation | null> {
    const query = `SELECT * FROM planting_associations WHERE id = $1`;
    const result = await this.query<PlantingAssociation>(query, [id]);
    return result.rows[0] || null;
  }

  async create(association: Partial<PlantingAssociation>): Promise<PlantingAssociation> {
    const query = `
      INSERT INTO planting_associations (
        primary_planting_id, companion_planting_id, compatibility_id,
        actual_distance_cm, actual_arrangement, actual_ratio,
        association_started, purpose, expected_benefit,
        user_notes, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.query<PlantingAssociation>(query, [
      association.primary_planting_id,
      association.companion_planting_id,
      association.compatibility_id || null,
      association.actual_distance_cm || null,
      association.actual_arrangement || null,
      association.actual_ratio || null,
      association.association_started || new Date(),
      association.purpose || null,
      association.expected_benefit || null,
      association.user_notes || null
    ]);

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const query = `UPDATE planting_associations SET is_active = false, updated_at = NOW() WHERE id = $1`;
    await this.query(query, [id]);
  }

  async getActivePlantingsByPlot(plotId: string): Promise<any[]> {
    const query = `
      SELECT 
        p.id,
        p.crop_catalog_id,
        cc.crop_name,
        cc.family
      FROM plantings p
      JOIN crop_catalog cc ON p.crop_catalog_id = cc.id
      WHERE p.plot_id = $1
        AND p.is_active = true
        AND p.status NOT IN ('harvested', 'archived', 'completed')
      ORDER BY p.actual_planting_date DESC
    `;

    const result = await this.query(query, [plotId]);
    return result.rows;
  }
}
