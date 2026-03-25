import { Pool } from 'pg';
import { UserGarden } from '../../domain/UserGarden';
import { UserGardenRepository } from '../../domain/UserGardenRepository';

export class PostgresUserGardenRepository implements UserGardenRepository {
  constructor(private pool: Pool) {}

  async save(userGarden: UserGarden): Promise<void> {
    const data = userGarden.to_persistence();
    
    const query: string = `
      INSERT INTO user_gardens (id, user_id, garden_id, garden_role, invited_by, invitation_accepted_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        garden_role = $4, updated_at = $8
    `;

    const values = [
      data.id, data.user_id, data.garden_id, data.garden_role,
      data.invited_by, data.invitation_accepted_at, data.created_at, data.updated_at
    ];

    try {
      await this.pool.query(query, values);
    } catch (error) {
      throw new Error(`Error saving user garden: ${error}`);
    }
  }

  async search_by_id(id: string): Promise<UserGarden | null> {
    const query: string = 'SELECT * FROM user_gardens WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return UserGarden.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching user garden by id: ${error}`);
    }
  }

  async find_by_user_and_garden(user_id: string, garden_id: string): Promise<UserGarden | null> {
    const query: string = 'SELECT * FROM user_gardens WHERE user_id = $1 AND garden_id = $2';
    
    try {
      const result = await this.pool.query(query, [user_id, garden_id]);
      if (result.rows.length === 0) {
        return null;
      }
      return UserGarden.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching user garden: ${error}`);
    }
  }

  async find_by_user(user_id: string): Promise<UserGarden[]> {
    const query: string = 'SELECT * FROM user_gardens WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await this.pool.query(query, [user_id]);
      return result.rows.map(row => UserGarden.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching user gardens: ${error}`);
    }
  }

  async find_by_garden(garden_id: string): Promise<UserGarden[]> {
    const query: string = 'SELECT * FROM user_gardens WHERE garden_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await this.pool.query(query, [garden_id]);
      return result.rows.map(row => UserGarden.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching garden users: ${error}`);
    }
  }

  async update(userGarden: UserGarden): Promise<void> {
    const data = userGarden.to_persistence();

    const query: string = `
      UPDATE user_gardens SET
        garden_role = $2, invitation_accepted_at = $3, updated_at = $4
      WHERE id = $1
    `;

    const values = [
      data.id, data.garden_role, data.invitation_accepted_at, data.updated_at
    ];

    try {
      const result = await this.pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('User garden not found');
      }
    } catch (error) {
      throw new Error(`Error updating user garden: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM user_gardens WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('User garden not found');
      }
    } catch (error) {
      throw new Error(`Error deleting user garden: ${error}`);
    }
  }

  async delete_by_user_and_garden(user_id: string, garden_id: string): Promise<void> {
    const query: string = 'DELETE FROM user_gardens WHERE user_id = $1 AND garden_id = $2';

    try {
      await this.pool.query(query, [user_id, garden_id]);
    } catch (error) {
      throw new Error(`Error deleting user garden: ${error}`);
    }
  }
}
