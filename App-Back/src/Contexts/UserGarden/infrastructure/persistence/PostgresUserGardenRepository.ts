import { UserGarden } from '../../domain/UserGarden';
import { UserGardenId } from '../../domain/value-objects/UserGardenId';
import { GardenRole } from '../../domain/UserGarden';
import { UserGardenRepository } from '../../domain/UserGardenRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresUserGardenRepository extends PostgresRepository implements UserGardenRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'user_gardens';
  }

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

    await this.query(query, values);
  }

  async create(data: {
    user_id: string;
    garden_id: string;
    garden_role: string;
    invited_by: string;
    invitation_accepted_at: Date | null;
  }): Promise<void> {
    const now = new Date();
    const id = new UserGardenId(crypto.randomUUID());

    const userGarden = new UserGarden({
      id,
      user_id: data.user_id,
      garden_id: data.garden_id,
      garden_role: data.garden_role as GardenRole,
      invited_by: data.invited_by,
      invitation_accepted_at: data.invitation_accepted_at,
      created_at: now,
      updated_at: now
    });

    await this.save(userGarden);
  }

  async search_by_id(id: string): Promise<UserGarden | null> {
    const query: string = 'SELECT * FROM user_gardens WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return UserGarden.from_persistence(result.rows[0]);
  }

  async find_by_user_and_garden(user_id: string, garden_id: string): Promise<UserGarden | null> {
    const query: string = 'SELECT * FROM user_gardens WHERE user_id = $1 AND garden_id = $2';

    const result = await this.query<any>(query, [user_id, garden_id]);
    if (result.rows.length === 0) {
      return null;
    }
    return UserGarden.from_persistence(result.rows[0]);
  }

  async accept_invitation(user_id: string, garden_id: string): Promise<void> {
    const now = new Date();
    const query: string = `
      UPDATE user_gardens SET
        invitation_accepted_at = $3,
        updated_at = $3
      WHERE user_id = $1 AND garden_id = $2
    `;

    const result = await this.query<any>(query, [user_id, garden_id, now]);
    if (result.rowCount === 0) {
      throw new Error('Invitation not found');
    }
  }

  async find_by_user(user_id: string): Promise<UserGarden[]> {
    const query: string = 'SELECT * FROM user_gardens WHERE user_id = $1 ORDER BY created_at DESC';

    const result = await this.query<any>(query, [user_id]);
    return result.rows.map(row => UserGarden.from_persistence(row));
  }

  async find_by_garden(garden_id: string): Promise<UserGarden[]> {
    const query: string = 'SELECT * FROM user_gardens WHERE garden_id = $1 ORDER BY created_at DESC';

    const result = await this.query<any>(query, [garden_id]);
    return result.rows.map(row => UserGarden.from_persistence(row));
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

    const result = await this.query<any>(query, values);
    if (result.rowCount === 0) {
      throw new Error('User garden not found');
    }
  }

  async delete(id: string): Promise<void> {
    const query: string = 'DELETE FROM user_gardens WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rowCount === 0) {
      throw new Error('User garden not found');
    }
  }

  async delete_by_user_and_garden(user_id: string, garden_id: string): Promise<void> {
    const query: string = 'DELETE FROM user_gardens WHERE user_id = $1 AND garden_id = $2';

    await this.query(query, [user_id, garden_id]);
  }

  async has_permission(userId: string, gardenId: string, requiredRole: string): Promise<boolean> {
    const query = `
      SELECT garden_role FROM user_gardens 
      WHERE user_id = $1 AND garden_id = $2
    `;
    try {
      const result = await this.query<any>(query, [userId, gardenId]);
      if (result.rows.length === 0) {
        return false;
      }

      const roleHierarchy: Record<string, number> = {
        'owner': 4,
        'manager': 3,
        'collaborator': 2,
        'viewer': 1
      };

      const userRole = result.rows[0].garden_role;
      return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    } catch (error) {
      throw new Error(`Error checking permission: ${error}`);
    }
  }

  async find_collaborators_by_garden(garden_id: string): Promise<any[]> {
    const query = `
      SELECT 
        ug.id,
        ug.user_id,
        ug.garden_id,
        ug.garden_role,
        ug.invitation_accepted_at,
        u.name as user_name,
        u.email as user_email
      FROM user_gardens ug
      LEFT JOIN users u ON ug.user_id = u.id
      WHERE ug.garden_id = $1
        AND ug.invitation_accepted_at IS NOT NULL
      ORDER BY ug.garden_role DESC, u.name ASC
    `;

    try {
      const result = await this.query<any>(query, [garden_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding collaborators: ${error}`);
    }
  }
}
