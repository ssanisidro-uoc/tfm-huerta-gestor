import { UserGardenRepository } from '../../infrastructure/persistence/UserGardenRepository';
import { GardenByIdFinder } from '../FindGardenById/GardenByIdFinder';
import { Pool } from 'pg';

export interface GardenInfo {
  id: string;
  name: string;
  climate_zone: string;
  location: any;
}

export interface PendingInvitation {
  id: string;
  garden_id: string;
  garden: GardenInfo;
  invited_by: string;
  invited_by_name: string;
  invited_by_email: string;
  invited_at: Date;
}

export interface SharedGardenResponse {
  garden_id: string;
  garden_role: string;
  invitation_accepted: boolean;
  invitation_accepted_at: Date | null;
  created_at: Date;
  garden: GardenInfo;
}

export interface MyGardensResponse {
  own: SharedGardenResponse[];
  shared: SharedGardenResponse[];
  pendingInvitations: PendingInvitation[];
}

export class MyGardensFinder {
  constructor(
    private userGardenRepository: UserGardenRepository,
    private gardenFinder: GardenByIdFinder,
    private pool: Promise<Pool>
  ) {}

  async run(userId: string): Promise<MyGardensResponse> {
    const userGardens = await this.userGardenRepository.find_by_user(userId);

    const own: SharedGardenResponse[] = [];
    const shared: SharedGardenResponse[] = [];
    const pendingInvitations: PendingInvitation[] = [];

    for (const ug of userGardens) {
      const garden = await this.gardenFinder.run(ug.garden_id);
      
      if (!garden) continue;

      const gardenInfo: GardenInfo = {
        id: garden.id.get_value(),
        name: garden.name.get_value(),
        climate_zone: garden.climate_zone.get_value(),
        location: garden.location.to_persistence()
      };

      const baseEntry = {
        garden_id: ug.garden_id,
        garden_role: ug.garden_role,
        invitation_accepted: ug.invitation_accepted_at !== null,
        invitation_accepted_at: ug.invitation_accepted_at,
        created_at: ug.created_at,
        garden: gardenInfo
      };

      if (ug.garden_role === 'owner') {
        own.push(baseEntry);
      } else if (ug.invitation_accepted_at !== null) {
        shared.push(baseEntry);
      }

      if (ug.invitation_accepted_at === null && ug.garden_role !== 'owner') {
        let inviterName = 'Usuario';
        let inviterEmail = '';
        const invitedBy = ug.invited_by || '';
        
        if (invitedBy) {
          const inviter = await this.getUserById(invitedBy);
          if (inviter) {
            inviterName = inviter.name || 'Usuario';
            inviterEmail = inviter.email || '';
          }
        }

        pendingInvitations.push({
          id: ug.id,
          garden_id: ug.garden_id,
          garden: gardenInfo,
          invited_by: invitedBy,
          invited_by_name: inviterName,
          invited_by_email: inviterEmail,
          invited_at: ug.created_at
        });
      }
    }

    return { own, shared, pendingInvitations };
  }

  private async getUserById(userId: string): Promise<{ name: string; email: string } | null> {
    const query = 'SELECT name, email FROM users WHERE id = $1';
    const pool = await this.pool;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }
}