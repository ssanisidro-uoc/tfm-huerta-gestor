import { Command } from '../../../Shared/domain/Command';

export class LogoutCommand extends Command {
  constructor(
    readonly user_id: string,
    readonly token: string
  ) {
    super();
  }
}
