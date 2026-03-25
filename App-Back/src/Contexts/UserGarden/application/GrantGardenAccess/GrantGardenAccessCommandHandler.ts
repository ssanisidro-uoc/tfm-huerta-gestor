import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { GrantGardenAccessCommand } from './GrantGardenAccessCommand';
import { GrantGardenAccessCreator } from './GrantGardenAccessCreator';

export class GrantGardenAccessCommandHandler implements CommandHandler<GrantGardenAccessCommand> {
  constructor(private creator: GrantGardenAccessCreator) {}

  subscribedTo(): Command {
    return GrantGardenAccessCommand;
  }

  async handle(command: GrantGardenAccessCommand): Promise<void> {
    await this.creator.run(
      command.id,
      command.user_id,
      command.garden_id,
      command.garden_role,
      command.invited_by
    );
  }
}
