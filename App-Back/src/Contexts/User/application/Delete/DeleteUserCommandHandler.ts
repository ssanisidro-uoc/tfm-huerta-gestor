import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { DeleteUserCommand } from './DeleteUserCommand';
import { UserDeleter } from './UserDeleter';

export class DeleteUserCommandHandler implements CommandHandler<DeleteUserCommand> {
  constructor(private deleter: UserDeleter) {}

  subscribedTo(): Command {
    return DeleteUserCommand;
  }

  async handle(command: DeleteUserCommand): Promise<void> {
    await this.deleter.run(command.id);
  }
}
