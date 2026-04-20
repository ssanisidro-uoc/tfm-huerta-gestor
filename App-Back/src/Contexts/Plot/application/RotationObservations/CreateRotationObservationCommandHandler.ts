import { RotationObservationsRepository } from '../../infrastructure/persistence/PostgresRotationObservationsRepository';

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
  constructor(private repository: RotationObservationsRepository) {}

  async handle(command: CreateRotationObservationCommand) {
    if (!command.previousPlantingId) {
      return null;
    }

    const description = command.harvestYieldKg 
      ? `Cosecha completada. Rendimiento: ${command.harvestYieldKg} kg`
      : 'Cosecha completada';

    return this.repository.create({
      previous_planting_id: command.previousPlantingId,
      current_planting_id: command.currentPlantingId,
      rotation_rule_id: command.rotationRuleId || undefined,
      observed_by: command.observedBy,
      observation_date: command.observationDate,
      observed_outcome: 'success',
      description
    });
  }
}
