import { Command } from '../../../Shared/domain/Command';

export class UpdateGardenCommand extends Command {
  constructor(
    readonly id: string,
    readonly data: {
      name?: string;
      description?: string | null;
      surface_m2?: number | null;
      climate_zone?: string;
      hardiness_zone?: string | null;
      location?: {
        address?: string;
        city: string;
        region?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
        timezone?: string;
      };
      is_active?: boolean;
    }
  ) {
    super();
  }
}
