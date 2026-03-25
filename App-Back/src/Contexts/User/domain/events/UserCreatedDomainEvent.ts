import { DomainEvent } from '../../../Shared/domain/DomainEvent';

export class UserCreatedDomainEvent extends DomainEvent {
  static readonly event_name: string = 'user.created';

  constructor(
    aggregate_id: string,
    readonly email: string,
    readonly role_id: string,
    event_id?: string,
    occurred_on?: Date
  ) {
    super(aggregate_id, event_id, occurred_on);
  }
}
