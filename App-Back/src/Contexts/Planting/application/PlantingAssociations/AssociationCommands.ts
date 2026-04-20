import { Command } from '../../../Shared/domain/Command';

export class CreateAssociationCommand extends Command {
  constructor(
    readonly primaryPlantingId: string,
    readonly companionPlantingId: string,
    readonly actualDistanceCm?: number,
    readonly actualArrangement?: string,
    readonly actualRatio?: string,
    readonly purpose?: string,
    readonly expectedBenefit?: string,
    readonly userNotes?: string
  ) {
    super();
  }
}

export class DeleteAssociationCommand extends Command {
  constructor(readonly id: string) {
    super();
  }
}

export class CreateObservationCommand extends Command {
  constructor(
    readonly associationId: string,
    readonly observedBy?: string,
    readonly observationType?: string,
    readonly outcome?: string,
    readonly effectivenessRating?: number,
    readonly description?: string,
    readonly measuredData?: Record<string, any>
  ) {
    super();
  }
}