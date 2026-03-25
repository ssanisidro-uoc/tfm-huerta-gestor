import { Command } from '../../../Shared/domain/Command';

export class DeleteGardenCommand extends Command {
  constructor(readonly id: string) {
    super();
  }
}
