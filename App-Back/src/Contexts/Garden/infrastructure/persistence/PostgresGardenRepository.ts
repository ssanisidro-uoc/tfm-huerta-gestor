import { Pool } from 'pg';
import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';

export class PostgresGardenRepository implements GardenRepository {
  constructor(private pool: Pool) {}

  async save(garden: Garden): Promise<void> {
    const garden_data = garden.to_persistence();
    
    const query: string = `
      INSERT INTO gardens (id, owner_id, name, surface_m2, climate_zone, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = $3,
        surface_m2 = $4,
        climate_zone = $5,
        is_active = $6,
        updated_at = $8
    `;

    const values = [
      garden_data.id,
      garden_data.owner_id,
      garden_data.name,
      garden_data.surface_m2,
      garden_data.climate_zone,
      garden_data.is_active,
      garden_data.created_at,
      garden_data.updated_at
    ];

    try {
      await this.pool.query(query, values);
    } catch (error) {
      throw new Error(`Error saving garden: ${error}`);
    }
  }

  async search_by_id(id: string): Promise<Garden | null> {
    const query: string = 'SELECT * FROM gardens WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return Garden.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching garden by id: ${error}`);
    }
  }

  async search_by_owner(
    owner_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Garden[]> {
    let query: string = 'SELECT * FROM gardens WHERE owner_id = $1';
    const values: any[] = [owner_id];

    if (options) {
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      values.push(options.limit, options.offset);
    } else {
      query += ' AND is_active = true ORDER BY created_at DESC';
    }

    try {
      const result = await this.pool.query(query, values);
      return result.rows.map(row => Garden.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching gardens by owner: ${error}`);
    }
  }

  async find_by_owner(
    owner_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Garden[]> {
    return this.search_by_owner(owner_id, options);
  }

  async count_by_owner(owner_id: string): Promise<number> {
    const query: string = 'SELECT COUNT(*) as total FROM gardens WHERE owner_id = $1';
    
    try {
      const result = await this.pool.query(query, [owner_id]);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      throw new Error(`Error counting gardens: ${error}`);
    }
  }

  async update(garden: Garden): Promise<void> {
    const garden_data = garden.to_persistence();

    const query: string = `
      UPDATE gardens SET
        name = $2,
        surface_m3 = $3,
        climate_zone = $4,
        is_active = $5,
        updated_at = $6
      WHERE id = $1
    `;

    const values = [
      garden_data.id,
      garden_data.name,
      garden_data.surface_m2,
      garden_data.climate_zone,
      garden_data.is_active,
      garden_data.updated_at
    ];

    try {
      const result = await this.pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('Garden not found');
      }
    } catch (error) {
      throw new Error(`Error updating garden: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM gardens WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('Garden not found');
      }
    } catch (error) {
      throw new Error(`Error deleting garden: ${error}`);
    }
  }
}
