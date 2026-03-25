import { CommandHandler } from '../../../Shared/domain/CommandHandler';
import { Command } from '../../../Shared/domain/Command';
import { LogoutCommand } from './LogoutCommand';
import { JwtHandler } from '../../../Shared/infrastructure/auth/JwtHandler';

export class LogoutCommandHandler implements CommandHandler<LogoutCommand> {
  constructor(private jwtHandler: JwtHandler) {}

  subscribedTo(): Command {
    return LogoutCommand;
  }

  async handle(command: LogoutCommand): Promise<void> {
    if (command.token) {
      this.jwtHandler.invalidate_token(command.token);
    }
  }
}
