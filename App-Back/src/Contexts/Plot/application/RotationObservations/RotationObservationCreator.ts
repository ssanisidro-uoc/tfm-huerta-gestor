import { RotationObservationsRepository } from '../../infrastructure/persistence/PostgresRotationObservationsRepository';

export interface CreateRotationObservationData {
  currentPlantingId: string;
  previousPlantingId: string | null;
  rotationRuleId: string | null;
  observedBy: string;
  observationDate: Date;
  harvestYieldKg?: number;
}

export class RotationObservationCreator {
  constructor(private repository: RotationObservationsRepository) {}

  async run(data: CreateRotationObservationData): Promise<void> {
    if (!data.previousPlantingId) {
      return;
    }

    const description = data.harvestYieldKg 
      ? `Cosecha completada. Rendimiento: ${data.harvestYieldKg} kg`
      : 'Cosecha completada';

    await this.repository.create({
      previous_planting_id: data.previousPlantingId,
      current_planting_id: data.currentPlantingId,
      rotation_rule_id: data.rotationRuleId || undefined,
      observed_by: data.observedBy,
      observation_date: data.observationDate,
      observed_outcome: 'success',
      description
    });
  }
}