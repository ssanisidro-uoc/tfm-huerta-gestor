import { Command } from '../../domain/Command';
import { CommandHandler } from '../../domain/CommandHandler';
import { CommandNotRegisteredError } from '../../domain/CommandNotRegisteredError';

export class CommandHandlers extends Map<string, CommandHandler<Command>> {
  constructor(commandHandlers: Array<CommandHandler<Command>>) {
    super();

    commandHandlers.forEach(commandHandler => {
      const subscribedCommand = commandHandler.subscribedTo();
      this.set(subscribedCommand.constructor.name, commandHandler);
    });
  }

  public get(command: Command): CommandHandler<Command> {
    const commandHandler = super.get(command.constructor.name);

    if (!commandHandler) {
      throw new CommandNotRegisteredError(command);
    }

    return commandHandler;
  }
}
