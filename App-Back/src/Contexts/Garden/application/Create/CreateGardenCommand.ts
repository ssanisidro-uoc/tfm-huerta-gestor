import { Command } from '../../../Shared/domain/Command';

export class CreateGardenCommand implements Command {
  constructor(
    readonly id: string,
    readonly owner_id: string,
    readonly name: string,
    readonly description: string | null,
    readonly surface_m2: number | null,
    readonly climate_zone: string,
    readonly hardiness_zone: string | null,
    readonly location: {
      address?: string;
      city: string;
      region?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    }
  ) {}
}
