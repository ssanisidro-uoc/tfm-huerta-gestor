import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import { Crop } from '../../domain/Crop';
import { CropRepository } from '../../domain/CropRepository';

export class PostgresCropRepository extends PostgresRepository implements CropRepository {
  protected tableName(): string {
    throw new Error('Method not implemented.');
  }

  async search_by_id(id: string): Promise<Crop | null> {
    const query: string = 'SELECT * FROM crop_catalog WHERE id = $1';

    try {
      const result = await this.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return Crop.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching crop by id: ${error}`);
    }
  }

  async search_all(options?: {
    page: number;
    limit: number;
    offset: number;
    filters?: { category?: string; family?: string; search?: string };
  }): Promise<Crop[]> {
    let query: string = 'SELECT * FROM crop_catalog';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (options?.filters) {
      if (options.filters.category) {
        conditions.push(`category = $${paramIndex++}`);
        values.push(options.filters.category);
      }
      if (options.filters.family) {
        conditions.push(`family = $${paramIndex++}`);
        values.push(options.filters.family);
      }
      if (options.filters.search) {
        conditions.push(
          `(common_name ILIKE $${paramIndex} OR scientific_name ILIKE $${paramIndex} OR family ILIKE $${paramIndex})`
        );
        values.push(`%${options.filters.search}%`);
        paramIndex++;
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY common_name ASC';

    if (options) {
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(options.limit, options.offset);
    }

    try {
      const result = await this.query(query, values);
      return result.rows.map((row) => Crop.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching crops: ${error}`);
    }
  }

  async search_by_family(family: string): Promise<Crop[]> {
    const query: string = 'SELECT * FROM crop_catalog WHERE family = $1 ORDER BY common_name ASC';

    try {
      const result = await this.query(query, [family]);
      return result.rows.map((row) => Crop.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching crops by family: ${error}`);
    }
  }

  async count(filters?: { category?: string; family?: string; search?: string }): Promise<number> {
    let query: string = 'SELECT COUNT(*) as total FROM crop_catalog';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.category) {
        conditions.push(`category = $${paramIndex++}`);
        values.push(filters.category);
      }
      if (filters.family) {
        conditions.push(`family = $${paramIndex++}`);
        values.push(filters.family);
      }
      if (filters.search) {
        conditions.push(
          `(common_name ILIKE $${paramIndex} OR scientific_name ILIKE $${paramIndex} OR family ILIKE $${paramIndex})`
        );
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
      const result = await this.query(query, values);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      throw new Error(`Error counting crops: ${error}`);
    }
  }

  async save(crop: Crop): Promise<void> {
    const crop_data = crop.to_persistence();

    const query: string = `
      INSERT INTO crop_catalog (
        id, common_name, scientific_name, family, days_to_maturity,
        min_temperature, max_temperature, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        common_name = EXCLUDED.common_name,
        scientific_name = EXCLUDED.scientific_name,
        family = EXCLUDED.family,
        days_to_maturity = EXCLUDED.days_to_maturity,
        min_temperature = EXCLUDED.min_temperature,
        max_temperature = EXCLUDED.max_temperature,
        updated_at = EXCLUDED.updated_at
    `;

    const values = [
      crop_data.id,
      crop_data.name,
      crop_data.scientific_name,
      crop_data.family,
      crop_data.days_to_maturity,
      crop_data.min_temperature,
      crop_data.max_temperature,
      crop_data.created_at,
      crop_data.updated_at
    ];

    try {
      await this.query(query, values);
    } catch (error) {
      throw new Error(`Error saving crop: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM crop_catalog WHERE id = $1';

    try {
      const result = await this.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('Crop not found');
      }
    } catch (error) {
      throw new Error(`Error deleting crop: ${error}`);
    }
  }
}
