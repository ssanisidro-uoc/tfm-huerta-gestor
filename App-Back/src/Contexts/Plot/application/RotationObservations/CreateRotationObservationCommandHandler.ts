import { RotationObservationCreator } from './RotationObservationCreator';

export class CreateRotationObservationCommand {
  constructor(
    public readonly currentPlantingId: string,
    public readonly previousPlantingId: string | null,
    public readonly rotationRuleId: string | null,
    public readonly observedBy: string,
    public readonly observationDate: Date,
    public readonly harvestYieldKg?: number
  ) {}
}

export class CreateRotationObservationCommandHandler {
  constructor(private creator: RotationObservationCreator) {}

  async handle(command: CreateRotationObservationCommand) {
    await this.creator.run({
      currentPlantingId: command.currentPlantingId,
      previousPlantingId: command.previousPlantingId,
      rotationRuleId: command.rotationRuleId,
      observedBy: command.observedBy,
      observationDate: command.observationDate,
      harvestYieldKg: command.harvestYieldKg
    });
  }
}