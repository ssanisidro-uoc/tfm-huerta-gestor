import { Command } from '../../../Shared/domain/Command';

export class CreatePlantingCommand implements Command {
  constructor(
    readonly id: string,
    readonly crop_id: string,
    readonly garden_id: string,
    readonly plot_id: string,
    readonly planted_at: Date,
    readonly expected_harvest_at: Date,
    readonly quantity: number,
    readonly crop_name?: string,
    readonly days_to_maturity?: number
  ) {}
}
