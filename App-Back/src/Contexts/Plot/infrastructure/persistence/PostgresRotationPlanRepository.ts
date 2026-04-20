import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class RotationPlanRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'rotation_plans';
  }

  async findByPlotId(plotId: string): Promise<any[]> {
    const query = `
      SELECT 
        rp.rotation_cycle_year,
        rp.sequence_order,
        rp.planned_planting_date,
        rp.expected_harvest_date,
        rp.plan_status,
        rp.rotation_score,
        rp.executed_planting_id,
        cc.common_name as crop_name,
        p.actual_planting_date,
        p.expected_harvest_at,
        p.harvested_at,
        ph.total_harvest_kg
      FROM rotation_plans rp
      LEFT JOIN crop_catalog cc ON cc.id = rp.planned_crop_catalog_id
      LEFT JOIN plantings p ON p.id = rp.executed_planting_id
      LEFT JOIN (
        SELECT planting_id, SUM(total_harvest_kg) as total_harvest_kg
        FROM plantings_harvests
        GROUP BY planting_id
      ) ph ON ph.planting_id = p.id
      WHERE rp.plot_id = $1
      ORDER BY rp.rotation_cycle_year DESC, rp.sequence_order ASC
    `;

    const result = await this.query<any>(query, [plotId]);
    return result.rows;
  }
}