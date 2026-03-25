export class FindGardenByIdResponse {
  constructor(
    readonly id: string,
    readonly owner_id: string,
    readonly name: string,
    readonly description: string | null,
    readonly surface_m2: number | null,
    readonly climate_zone: string,
    readonly hardiness_zone: string | null,
    readonly location: {
      address: string | null;
      city: string | null;
      region: string | null;
      country: string;
      latitude: number | null;
      longitude: number | null;
      timezone: string;
    },
    readonly is_active: boolean,
    readonly created_at: Date,
    readonly updated_at: Date
  ) {}
}
