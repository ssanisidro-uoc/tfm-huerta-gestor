import { Garden } from '../../domain/Garden';
import { GardenRepository } from '../../domain/GardenRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresGardenRepository extends PostgresRepository implements GardenRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'gardens';
  }

  async save(garden: Garden): Promise<void> {
    const garden_data = garden.to_persistence();

    const query: string = `
      INSERT INTO gardens (id, owner_id, name, surface_m2, climate_zone, is_active, created_at, updated_at, 
        location_address, location_city, location_region, location_country, location_latitude, location_longitude, location_timezone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        name = $3,
        surface_m2 = $4,
        climate_zone = $5,
        is_active = $6,
        updated_at = $8,
        location_address = $9,
        location_city = $10,
        location_region = $11,
        location_country = $12,
        location_latitude = $13,
        location_longitude = $14,
        location_timezone = $15
    `;

    const values = [
      garden_data.id,
      garden_data.owner_id,
      garden_data.name,
      garden_data.surface_m2,
      garden_data.climate_zone,
      garden_data.is_active,
      garden_data.created_at,
      garden_data.updated_at,
      garden_data.location_address,
      garden_data.location_city,
      garden_data.location_region,
      garden_data.location_country,
      garden_data.location_latitude,
      garden_data.location_longitude,
      garden_data.location_timezone
    ];

    await this.query(query, values);
  }

  async search_by_id(id: string): Promise<Garden | null> {
    const query: string = 'SELECT * FROM gardens WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return Garden.from_persistence(result.rows[0]);
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

    const result = await this.query<any>(query, values);
    return result.rows.map(row => Garden.from_persistence(row));
  }

  async find_by_owner(
    owner_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Garden[]> {
    return this.search_by_owner(owner_id, options);
  }

  async count_by_owner(owner_id: string): Promise<number> {
    const query: string = 'SELECT COUNT(*) as total FROM gardens WHERE owner_id = $1';

    const result = await this.query<any>(query, [owner_id]);
    return parseInt(result.rows[0].total, 10);
  }

  async update(garden: Garden): Promise<void> {
    const garden_data = garden.to_persistence();

    const query: string = `
      UPDATE gardens SET
        name = $2,
        surface_m2 = $3,
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

    const result = await this.query<any>(query, values);
    if (result.rowCount === 0) {
      throw new Error('Garden not found');
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM gardens WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rowCount === 0) {
      throw new Error('Garden not found');
    }
  }
}
