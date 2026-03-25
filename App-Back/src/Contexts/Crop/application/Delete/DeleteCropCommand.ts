import { Command } from '../../../Shared/domain/Command';

export class DeleteCropCommand extends Command {
  constructor(
    readonly id: string,
    readonly deleted_by: string
  ) {
    super();
  }
}
