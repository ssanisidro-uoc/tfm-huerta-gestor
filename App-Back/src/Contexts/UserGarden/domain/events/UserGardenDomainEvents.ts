import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class UserGardenAccessGrantedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'user_garden.access_granted';

  constructor(
    aggregate_id: string,
    readonly user_id: string,
    readonly garden_id: string,
    readonly garden_role: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class UserGardenAccessRevokedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'user_garden.access_revoked';

  constructor(
    aggregate_id: string,
    readonly user_id: string,
    readonly garden_id: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class UserGardenRoleUpdatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'user_garden.role_updated';

  constructor(
    aggregate_id: string,
    readonly user_id: string,
    readonly garden_id: string,
    readonly old_role: string,
    readonly new_role: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
