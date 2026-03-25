import { Command } from '../../../Shared/domain/Command';

export class DeleteUserCommand extends Command {
  constructor(readonly id: string) {
    super();
  }
}
