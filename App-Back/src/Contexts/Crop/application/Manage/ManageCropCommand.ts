import { Command } from '../../../Shared/domain/Command';

export class ManageCropCommand extends Command {
  constructor(
    readonly name: string,
    readonly scientific_name: string,
    readonly family: string,
    readonly days_to_maturity: number,
    readonly min_temperature: number,
    readonly max_temperature: number,
    readonly created_by: string,
    readonly id?: string
  ) {
    super();
  }
}
