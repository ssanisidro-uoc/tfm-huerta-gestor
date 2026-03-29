import { Plot } from '../../domain/Plot';
import { PlotRepository } from '../../domain/PlotRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresPlotRepository extends PostgresRepository implements PlotRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'plots';
  }

  async save(plot: Plot): Promise<void> {
    const plot_data = plot.to_persistence();

    const query: string = `
      INSERT INTO plots (
        id, garden_id, name, code, description, surface_m2, length_m, width_m, shape,
        position_x, position_y, plot_order, soil_type, soil_ph, soil_quality,
        irrigation_type, has_water_access, orientation, sun_exposure_hours,
        has_greenhouse, has_raised_bed, has_mulch, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      ON CONFLICT (id) DO UPDATE SET
        name = $3, description = $5, surface_m2 = $6, updated_at = $25
    `;

    const values = [
      plot_data.id, plot_data.garden_id, plot_data.name, plot_data.code, plot_data.description,
      plot_data.surface_m2, plot_data.length_m, plot_data.width_m, plot_data.shape,
      plot_data.position_x, plot_data.position_y, plot_data.plot_order, plot_data.soil_type,
      plot_data.soil_ph, plot_data.soil_quality, plot_data.irrigation_type, plot_data.has_water_access,
      plot_data.orientation, plot_data.sun_exposure_hours, plot_data.has_greenhouse,
      plot_data.has_raised_bed, plot_data.has_mulch, plot_data.is_active,
      plot_data.created_at, plot_data.updated_at
    ];

    await this.query(query, values);
  }

  async search_by_id(id: string): Promise<Plot | null> {
    const query: string = 'SELECT * FROM plots WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return Plot.from_persistence(result.rows[0]);
  }

  async find_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Plot[]> {
    let query: string = 'SELECT * FROM plots WHERE garden_id = $1 AND is_active = true';
    const values: any[] = [garden_id];

    if (options) {
      query += ` ORDER BY plot_order ASC, name ASC LIMIT $2 OFFSET $3`;
      values.push(options.limit, options.offset);
    }

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Plot.from_persistence(row));
  }

  async count_by_garden(garden_id: string): Promise<number> {
    const query: string = 'SELECT COUNT(*) as total FROM plots WHERE garden_id = $1 AND is_active = true';

    const result = await this.query<any>(query, [garden_id]);
    return parseInt(result.rows[0].total, 10);
  }

  async update(plot: Plot): Promise<void> {
    const plot_data = plot.to_persistence();

    const query: string = `
      UPDATE plots SET
        name = $2, description = $3, surface_m2 = $4, soil_type = $5,
        irrigation_type = $6, is_active = $7, updated_at = $8
      WHERE id = $1
    `;

    const values = [
      plot_data.id, plot_data.name, plot_data.description, plot_data.surface_m2,
      plot_data.soil_type, plot_data.irrigation_type, plot_data.is_active, plot_data.updated_at
    ];

    const result = await this.query<any>(query, values);
    if (result.rowCount === 0) {
      throw new Error('Plot not found');
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM plots WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rowCount === 0) {
      throw new Error('Plot not found');
    }
  }
}
