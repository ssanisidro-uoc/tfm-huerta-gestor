import { Command } from '../../../Shared/domain/Command';

export class DeleteManualTaskCommand extends Command {
  constructor(
    readonly task_id: string,
    readonly deleted_by: string
  ) {
    super();
  }
}
