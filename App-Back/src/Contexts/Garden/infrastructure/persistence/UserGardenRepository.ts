import { Pool } from 'pg';

export interface UserGarden {
  id: string;
  user_id: string;
  garden_id: string;
  garden_role: string;
  invited_by: string | null;
  invitation_accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserGardenWithDetails extends UserGarden {
  user_email?: string;
  garden_name?: string;
}

export class UserGardenRepository {
  constructor(private pool: Pool) {}

  async find_by_user_and_garden(userId: string, gardenId: string): Promise<UserGarden | null> {
    const query = 'SELECT * FROM user_gardens WHERE user_id = $1 AND garden_id = $2';
    try {
      const result = await this.pool.query(query, [userId, gardenId]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user garden: ${error}`);
    }
  }

  async find_by_user(userId: string): Promise<UserGarden[]> {
    const query = 'SELECT * FROM user_gardens WHERE user_id = $1 ORDER BY created_at DESC';
    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding user gardens: ${error}`);
    }
  }

  async find_by_garden(gardenId: string): Promise<UserGardenWithDetails[]> {
    const query = `
      SELECT ug.*, u.email as user_email, g.name as garden_name
      FROM user_gardens ug
      JOIN users u ON ug.user_id = u.id
      JOIN gardens g ON ug.garden_id = g.id
      WHERE ug.garden_id = $1
      ORDER BY ug.created_at DESC
    `;
    try {
      const result = await this.pool.query(query, [gardenId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding garden users: ${error}`);
    }
  }

  async find_by_email(gardenId: string, email: string): Promise<UserGarden | null> {
    const query = `
      SELECT ug.* FROM user_gardens ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.garden_id = $1 AND u.email = $2
    `;
    try {
      const result = await this.pool.query(query, [gardenId, email.toLowerCase()]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  async create(userGarden: Omit<UserGarden, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const query = `
      INSERT INTO user_gardens (user_id, garden_id, garden_role, invited_by, invitation_accepted_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    try {
      await this.pool.query(query, [
        userGarden.user_id,
        userGarden.garden_id,
        userGarden.garden_role,
        userGarden.invited_by,
        userGarden.invitation_accepted_at
      ]);
    } catch (error) {
      throw new Error(`Error creating user garden: ${error}`);
    }
  }

  async update_role(userId: string, gardenId: string, gardenRole: string): Promise<void> {
    const query = `
      UPDATE user_gardens SET garden_role = $3, updated_at = NOW()
      WHERE user_id = $1 AND garden_id = $2
    `;
    try {
      const result = await this.pool.query(query, [userId, gardenId, gardenRole]);
      if (result.rowCount === 0) {
        throw new Error('User garden relationship not found');
      }
    } catch (error) {
      throw new Error(`Error updating user garden: ${error}`);
    }
  }

  async accept_invitation(userId: string, gardenId: string): Promise<void> {
    const query = `
      UPDATE user_gardens 
      SET invitation_accepted_at = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND garden_id = $2 AND invitation_accepted_at IS NULL
    `;
    try {
      const result = await this.pool.query(query, [userId, gardenId]);
      if (result.rowCount === 0) {
        throw new Error('Invitation not found or already accepted');
      }
    } catch (error) {
      throw new Error(`Error accepting invitation: ${error}`);
    }
  }

  async delete(userId: string, gardenId: string): Promise<void> {
    const query = 'DELETE FROM user_gardens WHERE user_id = $1 AND garden_id = $2';
    try {
      const result = await this.pool.query(query, [userId, gardenId]);
      if (result.rowCount === 0) {
        throw new Error('User garden relationship not found');
      }
    } catch (error) {
      throw new Error(`Error deleting user garden: ${error}`);
    }
  }

  async has_permission(userId: string, gardenId: string, requiredRole: string): Promise<boolean> {
    const query = `
      SELECT garden_role FROM user_gardens 
      WHERE user_id = $1 AND garden_id = $2
    `;
    try {
      const result = await this.pool.query(query, [userId, gardenId]);
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
}
