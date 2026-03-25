import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class PlotCreatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'plot.created';

  constructor(
    aggregate_id: string,
    readonly name: string,
    readonly garden_id: string,
    readonly surface_m2: number,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class PlotUpdatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'plot.updated';

  constructor(
    aggregate_id: string,
    readonly name: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}

export class PlotDeletedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'plot.deleted';

  constructor(
    aggregate_id: string,
    readonly garden_id: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
