import { UserPreferences } from '../../domain/UserPreferences/UserPreferences';
import { UserPreferencesRepository } from '../../domain/UserPreferencesRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresUserPreferencesRepository extends PostgresRepository implements UserPreferencesRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'user_preferences';
  }

  async save(preferences: UserPreferences): Promise<void> {
    const data = preferences.to_persistence();

    const query: string = `
      INSERT INTO user_preferences (id, user_id, language, theme, notifications_enabled, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        language = $3,
        theme = $4,
        notifications_enabled = $5,
        updated_at = $7
    `;

    const values: any[] = [
      data.id,
      data.user_id,
      data.language,
      data.theme,
      data.notifications_enabled,
      data.created_at,
      data.updated_at
    ];

    await this.query(query, values);
  }

  async search_by_user_id(user_id: string): Promise<UserPreferences | null> {
    const query: string = 'SELECT * FROM user_preferences WHERE user_id = $1';

    const result = await this.query<any>(query, [user_id]);
    if (result.rows.length === 0) {
      return null;
    }
    return UserPreferences.from_persistence(result.rows[0]);
  }

  async update(preferences: UserPreferences): Promise<void> {
    const data = preferences.to_persistence();

    const query: string = `
      UPDATE user_preferences SET
        language = $2,
        theme = $3,
        notifications_enabled = $4,
        updated_at = $5
      WHERE user_id = $1
    `;

    const values: any[] = [
      data.user_id,
      data.language,
      data.theme,
      data.notifications_enabled,
      data.updated_at
    ];

    const result = await this.query<any>(query, values);
    if (result.rowCount === 0) {
      throw new Error('User preferences not found');
    }
  }

  async delete(user_id: string): Promise<void> {
    const query: string = 'DELETE FROM user_preferences WHERE user_id = $1';

    await this.query(query, [user_id]);
  }
}