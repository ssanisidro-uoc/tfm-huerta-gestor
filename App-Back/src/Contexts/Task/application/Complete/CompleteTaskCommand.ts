import { Command } from '../../../Shared/domain/Command';

export class CompleteTaskCommand extends Command {
  constructor(
    readonly id: string,
    readonly completed_by: string,
    readonly completion_notes?: string,
    readonly actual_duration_minutes?: number
  ) {
    super();
  }
}
