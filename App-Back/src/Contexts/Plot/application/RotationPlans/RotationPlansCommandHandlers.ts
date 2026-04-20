import { Pool } from 'pg';
import { RotationPlanCreator, CreateRotationPlanCommand, RotationPlanUpdater, UpdateRotationPlanCommand } from './RotationPlansService';

export class CreateRotationPlanCommandHandler {
  constructor(private creator: RotationPlanCreator) {}

  async handle(command: CreateRotationPlanCommand) {
    return this.creator.create(command);
  }
}

export class UpdateRotationPlanCommandHandler {
  constructor(private updater: RotationPlanUpdater) {}

  async handle(command: UpdateRotationPlanCommand) {
    return this.updater.update(command);
  }
}

export class DeleteRotationPlanCommandHandler {
  constructor(private updater: RotationPlanUpdater) {}

  async handle(command: { id: string }) {
    return this.updater.delete(command.id);
  }
}
