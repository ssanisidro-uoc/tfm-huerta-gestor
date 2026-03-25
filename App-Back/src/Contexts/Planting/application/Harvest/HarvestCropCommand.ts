import { Command } from '../../../Shared/domain/Command';

export class HarvestCropCommand extends Command {
  constructor(
    readonly id: string,
    readonly harvested_by: string,
    readonly harvest_date: Date,
    readonly total_harvest_kg?: number,
    readonly harvest_quality?: string,
    readonly harvest_notes?: string
  ) {
    super();
  }
}
