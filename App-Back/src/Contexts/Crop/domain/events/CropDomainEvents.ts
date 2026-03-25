import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class CropCreatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'crop.created';

  constructor(
    aggregate_id: string,
    readonly name: string,
    readonly family: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class CropUpdatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'crop.updated';

  constructor(
    aggregate_id: string,
    readonly name: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
