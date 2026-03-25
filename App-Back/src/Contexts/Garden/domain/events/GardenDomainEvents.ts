import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class GardenCreatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'garden.created';

  constructor(
    aggregate_id: string,
    readonly name: string,
    readonly owner_id: string,
    readonly climate_zone: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class GardenUpdatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'garden.updated';

  constructor(
    aggregate_id: string,
    readonly name: string,
    readonly climate_zone: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class GardenDeletedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'garden.deleted';

  constructor(
    aggregate_id: string,
    readonly owner_id: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
