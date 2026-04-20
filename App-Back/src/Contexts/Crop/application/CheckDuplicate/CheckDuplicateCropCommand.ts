import { Command } from '../../../Shared/domain/Command';

export class CheckDuplicateCropCommand extends Command {
  constructor(
    public readonly name: string,
    public readonly scientificName?: string,
    public readonly excludeId?: string
  ) {
    super();
  }
}
