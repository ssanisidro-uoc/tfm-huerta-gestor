import { Uuid } from './value-object/Uuid';

export abstract class DomainEvent {
  readonly aggregate_id: string;
  readonly event_id: string;
  readonly occurred_on: Date;

  constructor(aggregate_id: string, event_id?: string, occurred_on?: Date) {
    this.aggregate_id = aggregate_id;
    this.event_id = event_id || Uuid.random().get_value();
    this.occurred_on = occurred_on || new Date();
  }

  static event_name: string;
}
