import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { CreateWeatherObservationCommand, AcknowledgeWeatherAlertCommand } from './WeatherCommands';
import { WeatherObservationsRepository } from '../WeatherObservationsService';
import { WeatherAlertsRepository } from '../WeatherAlertsService';

export class CreateWeatherObservationCommandHandler implements CommandHandler<CreateWeatherObservationCommand> {
  constructor(private repository: WeatherObservationsRepository) {}

  subscribedTo(): Command {
    return CreateWeatherObservationCommand;
  }

  async handle(command: CreateWeatherObservationCommand): Promise<any> {
    return this.repository.create({
      garden_id: command.gardenId,
      weather_alert_id: command.weatherAlertId,
      planting_id: command.plantingId,
      task_id: command.taskId,
      observed_by: command.observedBy,
      observation_date: new Date(),
      action_taken: command.actionTaken || false,
      action_type: command.actionType,
      observed_outcome: command.observedOutcome,
      damage_occurred: command.damageOccurred || false,
      damage_severity: command.damageSeverity,
      damage_description: command.damageDescription,
      notes: command.notes
    });
  }
}

export class AcknowledgeWeatherAlertCommandHandler implements CommandHandler<AcknowledgeWeatherAlertCommand> {
  constructor(private repository: WeatherAlertsRepository) {}

  subscribedTo(): Command {
    return AcknowledgeWeatherAlertCommand;
  }

  async handle(command: AcknowledgeWeatherAlertCommand): Promise<void> {
    return this.repository.acknowledge(command.alertId, command.userId || '');
  }
}