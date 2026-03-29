import { Command } from '../../../Shared/domain/Command';
import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { CreateUserCommand } from '../Create/CreateUserCommand';
import { UserCreator } from './UserCreator';

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand> {
  constructor(private creator: UserCreator) {}

  subscribedTo(): Command {
    return CreateUserCommand;
  }

  async handle(command: CreateUserCommand): Promise<void> {
    await this.creator.run(
      command.id,
      command.name,
      command.email,
      command.password_hash,
      command.role_id
    );
  }
}
