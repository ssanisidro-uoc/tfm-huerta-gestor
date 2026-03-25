import { Command } from '../../../Shared/domain/Command';

export class DeletePlotCommand implements Command {
  constructor(
    readonly id: string
  ) {}
}
