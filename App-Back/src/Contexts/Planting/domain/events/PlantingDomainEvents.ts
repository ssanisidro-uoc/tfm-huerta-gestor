import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class PlantingCreatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'planting.created';

  constructor(
    aggregate_id: string,
    readonly crop_id: string,
    readonly garden_id: string,
    readonly plot_id: string,
    readonly planted_at: Date,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class PlantingHarvestedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'planting.harvested';

  constructor(
    aggregate_id: string,
    readonly crop_id: string,
    readonly garden_id: string,
    readonly quantity: number,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class PlantingDeletedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'planting.deleted';

  constructor(
    aggregate_id: string,
    readonly garden_id: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
