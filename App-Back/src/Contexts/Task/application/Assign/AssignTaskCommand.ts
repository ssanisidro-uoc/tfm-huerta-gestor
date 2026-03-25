import { Command } from '../../../Shared/domain/Command';

export class AssignTaskCommand extends Command {
  constructor(
    readonly id: string,
    readonly assigned_to: string,
    readonly assigned_by: string
  ) {
    super();
  }
}
