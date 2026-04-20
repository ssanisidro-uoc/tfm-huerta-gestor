import { Command } from '../../../Shared/domain/Command';

export class CreateWeatherObservationCommand extends Command {
  constructor(
    readonly gardenId: string,
    readonly weatherAlertId?: string,
    readonly plantingId?: string,
    readonly taskId?: string,
    readonly observedBy?: string,
    readonly actionTaken?: boolean,
    readonly actionType?: string,
    readonly observedOutcome?: string,
    readonly damageOccurred?: boolean,
    readonly damageSeverity?: string,
    readonly damageDescription?: string,
    readonly notes?: string
  ) {
    super();
  }
}

export class AcknowledgeWeatherAlertCommand extends Command {
  constructor(
    readonly alertId: string,
    readonly userId?: string
  ) {
    super();
  }
}