export class GetPlantingStatusResponse {
  constructor(
    readonly id: string,
    readonly crop: {
      id: string;
      name: string;
      days_to_maturity: number;
    },
    readonly planted_at: Date,
    readonly expected_harvest_at: Date,
    readonly status: string,
    readonly harvested_at: Date | null,
    readonly harvest_info?: {
      total_harvest_kg?: number;
      harvest_quality?: string;
      harvest_notes?: string;
    },
    readonly phenological?: {
      phase: string;
      progress: number;
      description: string;
      days_elapsed: number;
      days_to_harvest: number;
      days_until_harvest_text: string;
    },
    readonly actions?: string[]
  ) {}
}
