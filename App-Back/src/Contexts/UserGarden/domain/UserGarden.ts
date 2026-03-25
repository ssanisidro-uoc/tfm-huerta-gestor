import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { UserGardenId } from './value-objects/UserGardenId';

export enum GardenRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer'
}

export class UserGarden extends AggregateRoot {
  readonly id: UserGardenId;
  readonly user_id: string;
  readonly garden_id: string;
  readonly garden_role: GardenRole;
  readonly invited_by: string | null;
  readonly invitation_accepted_at: Date | null;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(data: {
    id: UserGardenId;
    user_id: string;
    garden_id: string;
    garden_role: GardenRole;
    invited_by?: string | null;
    invitation_accepted_at?: Date | null;
    created_at: Date;
    updated_at: Date;
  }) {
    super();
    this.id = data.id;
    this.user_id = data.user_id;
    this.garden_id = data.garden_id;
    this.garden_role = data.garden_role;
    this.invited_by = data.invited_by || null;
    this.invitation_accepted_at = data.invitation_accepted_at || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static create(data: {
    id: UserGardenId;
    user_id_value: string;
    garden_id_value: string;
    garden_role: GardenRole;
    invited_by?: string | null;
  }): UserGarden {
    const now = new Date();
    return new UserGarden({
      id: data.id,
      user_id: data.user_id_value,
      garden_id: data.garden_id_value,
      garden_role: data.garden_role,
      invited_by: data.invited_by || null,
      created_at: now,
      updated_at: now
    });
  }

  static from_persistence(raw: any): UserGarden {
    return new UserGarden({
      id: new UserGardenId(raw.id),
      user_id: raw.user_id,
      garden_id: raw.garden_id,
      garden_role: raw.garden_role as GardenRole,
      invited_by: raw.invited_by,
      invitation_accepted_at: raw.invitation_accepted_at ? new Date(raw.invitation_accepted_at) : null,
      created_at: new Date(raw.created_at),
      updated_at: new Date(raw.updated_at)
    });
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      user_id: this.user_id,
      garden_id: this.garden_id,
      garden_role: this.garden_role,
      invited_by: this.invited_by,
      invitation_accepted_at: this.invitation_accepted_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  accept_invitation(): UserGarden {
    return new UserGarden({
      ...this,
      invitation_accepted_at: new Date(),
      updated_at: new Date()
    });
  }

  update_role(new_role: GardenRole): UserGarden {
    return new UserGarden({
      ...this,
      garden_role: new_role,
      updated_at: new Date()
    });
  }
}
