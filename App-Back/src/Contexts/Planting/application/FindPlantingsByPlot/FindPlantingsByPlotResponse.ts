export interface PlantingByPlotData {
  id: string;
  crop_id: string;
  crop_name?: string;
  garden_id: string;
  plot_id: string;
  planted_at: Date;
  expected_harvest_at: Date;
  harvested_at: Date | null;
  quantity: number;
  status: string;
  days_elapsed?: number;
  days_to_harvest?: number;
}

export interface FindPlantingsByPlotResponse {
  plantings: PlantingByPlotData[];
}

export class FindPlantingsByPlotResponse {
  constructor(public plantings: PlantingByPlotData[]) {}
}
