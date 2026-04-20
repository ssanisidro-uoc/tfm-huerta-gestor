import { UserSession } from '../../domain/UserSession/UserSession';
import { UserSessionRepository } from '../../domain/UserSessionRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresUserSessionRepository extends PostgresRepository implements UserSessionRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'user_sessions';
  }

  async save(session: UserSession): Promise<void> {
    const data = session.to_persistence();

    const query: string = `
      INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, is_active, expires_at, created_at, last_activity_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values: any[] = [
      data.id,
      data.user_id,
      data.token_hash,
      data.ip_address,
      data.user_agent,
      data.is_active,
      data.expires_at,
      data.created_at,
      data.last_activity_at
    ];

    await this.query(query, values);
  }

  async find_by_token_hash(token_hash: string): Promise<UserSession | null> {
    const query: string = 'SELECT * FROM user_sessions WHERE token_hash = $1';

    const result = await this.query<any>(query, [token_hash]);
    if (result.rows.length === 0) {
      return null;
    }
    return UserSession.from_persistence(result.rows[0]);
  }

  async find_active_by_user_id(user_id: string): Promise<UserSession[]> {
    const query: string = `
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    const result = await this.query<any>(query, [user_id]);
    return result.rows.map((row) => UserSession.from_persistence(row));
  }

  async update(session: UserSession): Promise<void> {
    const data = session.to_persistence();

    const query: string = `
      UPDATE user_sessions SET
        is_active = $2,
        last_activity_at = $3
      WHERE id = $1
    `;

    const values: any[] = [
      data.id,
      data.is_active,
      data.last_activity_at
    ];

    await this.query(query, values);
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM user_sessions WHERE id = $1';
    await this.query(query, [id]);
  }

  async delete_expired(): Promise<void> {
    const query: string = `
      DELETE FROM user_sessions 
      WHERE expires_at < NOW()
    `;
    await this.query(query, []);
  }

  async delete_old_sessions(user_id: string, keep_count: number): Promise<void> {
    const query: string = `
      DELETE FROM user_sessions
      WHERE user_id = $1
      AND id NOT IN (
        SELECT id FROM user_sessions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      )
    `;
    await this.query(query, [user_id, keep_count]);
  }
}