import { Pool } from 'pg';
import { Planting } from '../../domain/Planting';
import { PlantingRepository } from '../../domain/PlantingRepository';

export class PostgresPlantingRepository implements PlantingRepository {
  constructor(private pool: Pool) {}

  async save(planting: Planting): Promise<void> {
    const planting_data = planting.to_persistence();
    
    const query: string = `
      INSERT INTO plantings (id, crop_catalog_id, garden_id, plot_id, planted_at, expected_harvest_at, harvested_at, quantity, unit, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        harvested_at = $7,
        is_active = $10,
        updated_at = $12
    `;

    const values = [
      planting_data.id,
      planting_data.crop_catalog_id,
      planting_data.garden_id,
      planting_data.plot_id,
      planting_data.planted_at,
      planting_data.expected_harvest_at,
      planting_data.harvested_at,
      planting_data.quantity,
      planting_data.unit,
      planting_data.is_active,
      planting_data.created_at,
      planting_data.updated_at
    ];

    try {
      await this.pool.query(query, values);
    } catch (error) {
      throw new Error(`Error saving planting: ${error}`);
    }
  }

  async search_by_id(id: string): Promise<Planting | null> {
    const query: string = 'SELECT * FROM plantings WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return Planting.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching planting by id: ${error}`);
    }
  }

  async search_by_garden(garden_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE garden_id = $1 ORDER BY planted_at DESC';
    
    try {
      const result = await this.pool.query(query, [garden_id]);
      return result.rows.map(row => Planting.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching plantings by garden: ${error}`);
    }
  }

  async search_active_by_garden(garden_id: string): Promise<Planting[]> {
    const query: string = 'SELECT * FROM plantings WHERE garden_id = $1 AND is_active = true ORDER BY planted_at DESC';
    
    try {
      const result = await this.pool.query(query, [garden_id]);
      return result.rows.map(row => Planting.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching active plantings by garden: ${error}`);
    }
  }
}
