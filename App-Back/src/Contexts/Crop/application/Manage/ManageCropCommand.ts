import { Command } from '../../../Shared/domain/Command';

export class ManageCropCommand extends Command {
  constructor(
    readonly name: string,
    readonly scientific_name: string,
    readonly family: string,
    readonly category: string,
    readonly days_to_harvest_min: number,
    readonly days_to_harvest_max: number,
    readonly created_by: string,
    readonly id?: string,
    readonly min_temperature_c?: number,
    readonly max_temperature_c?: number,
    readonly sun_requirement?: string,
    readonly water_requirement?: string
  ) {
    super();
  }
}
