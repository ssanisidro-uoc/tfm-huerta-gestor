import { Planting } from '../../domain/Planting';
import { PlantingRepository } from '../../domain/PlantingRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresPlantingRepository extends PostgresRepository implements PlantingRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'plantings';
  }

  async save(planting: Planting): Promise<void> {
    const planting_data = planting.to_persistence();

    const query: string = `
      INSERT INTO plantings (id, crop_catalog_id, garden_id, plot_id, planned_planting_date, actual_planting_date, expected_harvest_date, first_harvest_date, quantity, status, health_status, is_active, total_harvest_kg, harvest_quality, harvest_notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        first_harvest_date = $8,
        status = $10,
        is_active = $12,
        total_harvest_kg = $13,
        harvest_quality = $14,
        harvest_notes = $15,
        updated_at = $17
    `;

    const values = [
      planting_data.id,
      planting_data.crop_catalog_id,
      planting_data.garden_id,
      planting_data.plot_id,
      planting_data.planned_planting_date,
      planting_data.actual_planting_date,
      planting_data.expected_harvest_date,
      planting_data.first_harvest_date,
      planting_data.quantity,
      planting_data.status,
      planting_data.health_status,
      planting_data.is_active,
      planting_data.total_harvest_kg,
      planting_data.harvest_quality,
      planting_data.harvest_notes,
      planting_data.created_at,
      planting_data.updated_at
    ];

    await this.query(query, values);
  }

  async search_by_id(id: string): Promise<Planting | null> {
    const query: string = 'SELECT * FROM plantings WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return Planting.from_persistence(result.rows[0]);
  }

  async search_by_garden(garden_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE garden_id = $1 ORDER BY actual_planting_date DESC';

    const result = await this.query<any>(query, [garden_id]);
    return result.rows.map(row => Planting.from_persistence(row));
  }

  async search_active_by_garden(garden_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE garden_id = $1 AND is_active = true ORDER BY actual_planting_date DESC';

    const result = await this.query<any>(query, [garden_id]);
    return result.rows.map(row => Planting.from_persistence(row));
  }

  async search_archived_by_garden(garden_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE garden_id = $1 AND (is_active = false OR status IN (\'completed\', \'archived\', \'harvested\')) ORDER BY first_harvest_date DESC, actual_planting_date DESC';

    const result = await this.query<any>(query, [garden_id]);
    return result.rows.map(row => Planting.from_persistence(row));
  }

  async search_by_plot(plot_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE plot_id = $1 ORDER BY actual_planting_date DESC';

    const result = await this.query<any>(query, [plot_id]);
    return result.rows.map(row => Planting.from_persistence(row));
  }

  async search_active_by_plot(plot_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE plot_id = $1 AND is_active = true ORDER BY actual_planting_date DESC';

    const result = await this.query<any>(query, [plot_id]);
    return result.rows.map(row => Planting.from_persistence(row));
  }

  async findRecentByPlot(plotId: string, limit: number): Promise<any[]> {
    const query = `
      SELECT p.id, p.crop_catalog_id, p.plot_id, p.actual_planting_date, p.first_harvest_date, p.status, cc.common_name as crop_name
      FROM plantings p
      LEFT JOIN crop_catalog cc ON p.crop_catalog_id = cc.id
      WHERE p.plot_id = $1
        AND p.is_active = true
        AND p.actual_planting_date IS NOT NULL
      ORDER BY p.actual_planting_date DESC
      LIMIT $2
    `;

    const result = await this.query<any>(query, [plotId, limit]);
    return result.rows;
  }
}
