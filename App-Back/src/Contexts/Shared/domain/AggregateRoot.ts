import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot {
  private domain_events: DomainEvent[] = [];

  protected record(domain_event: DomainEvent): void {
    this.domain_events.push(domain_event);
  }

  pull_domain_events(): DomainEvent[] {
    const events = this.domain_events;
    this.domain_events = [];
    return events;
  }
}
