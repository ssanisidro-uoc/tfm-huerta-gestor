import { Pool } from 'pg';
import { User } from '../../domain/User';
import { UserRepository } from '../../domain/UserRepository';

export class PostgresUserRepository implements UserRepository {
  constructor(private pool: Pool) {}

  async save(user: User): Promise<void> {
    const user_data = user.to_persistence();

    const query: string = `
      INSERT INTO users (id, name, email, password_hash, role_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = $2,
        email = $3,
        password_hash = $4,
        role_id = $5,
        is_active = $6,
        updated_at = $8
    `;

    const values: any[] = [
      user_data.id,
      user_data.name,
      user_data.email,
      user_data.password_hash,
      user_data.role_id,
      user_data.is_active,
      user_data.created_at,
      user_data.updated_at
    ];

    try {
      await this.pool.query(query, values);
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  async search_by_id(id: string): Promise<User | null> {
    const query: string = 'SELECT * FROM users WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return User.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching user by id: ${error}`);
    }
  }

  async search_all(options?: {
    page: number;
    limit: number;
    offset: number;
    filters?: { is_active?: boolean; role_id?: string };
  }): Promise<User[]> {
    let query: string = 'SELECT * FROM users';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (options?.filters) {
      if (options.filters.is_active !== undefined) {
        conditions.push(`is_active = $${paramIndex++}`);
        values.push(options.filters.is_active);
      }
      if (options.filters.role_id) {
        conditions.push(`role_id = $${paramIndex++}`);
        values.push(options.filters.role_id);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (options) {
      query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      values.push(options.limit, options.offset);
    }

    try {
      const result = await this.pool.query(query, values);
      return result.rows.map((row) => User.from_persistence(row));
    } catch (error) {
      throw new Error(`Error searching users: ${error}`);
    }
  }

  async count(filters?: { is_active?: boolean; role_id?: string }): Promise<number> {
    let query: string = 'SELECT COUNT(*) as total FROM users';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.is_active !== undefined) {
        conditions.push(`is_active = $${paramIndex++}`);
        values.push(filters.is_active);
      }
      if (filters.role_id) {
        conditions.push(`role_id = $${paramIndex++}`);
        values.push(filters.role_id);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      throw new Error(`Error counting users: ${error}`);
    }
  }

  async search_by_email(email: string): Promise<User | null> {
    const query: string = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await this.pool.query(query, [email]);
      if (result.rows.length === 0) {
        return null;
      }
      return User.from_persistence(result.rows[0]);
    } catch (error) {
      throw new Error(`Error searching user by email: ${error}`);
    }
  }

  async find_by_email(email: string): Promise<User | null> {
    return this.search_by_email(email);
  }

  async update(user: User): Promise<void> {
    const user_data = user.to_persistence();

    const query: string = `
      UPDATE users SET
        name = $2,
        email = $3,
        role_id = $4,
        is_active = $5,
        updated_at = $6
      WHERE id = $1
    `;

    const values: any[] = [
      user_data.id,
      user_data.name,
      user_data.email,
      user_data.role_id,
      user_data.is_active,
      user_data.updated_at
    ];

    try {
      const result = await this.pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM users WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(`Error deleting user: ${error}`);
    }
  }
}
