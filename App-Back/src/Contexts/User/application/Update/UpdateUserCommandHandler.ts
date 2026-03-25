import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { UpdateUserCommand } from './UpdateUserCommand';
import { UserUpdater } from './UserUpdater';

export class UpdateUserCommandHandler implements CommandHandler<UpdateUserCommand> {
  constructor(private updater: UserUpdater) {}

  subscribedTo(): Command {
    return UpdateUserCommand;
  }

  async handle(command: UpdateUserCommand): Promise<void> {
    await this.updater.run(command.id, {
      name: command.name,
      email: command.email,
      password: command.password,
      role_id: command.role_id,
      is_active: command.is_active
    });
  }
}
