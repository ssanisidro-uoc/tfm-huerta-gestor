export interface RotationHistoryItem {
  plot_id: string;
  plot_name: string;
  garden_name: string;
  rotations: {
    year: number;
    sequence: number;
    crop_name: string;
    planting_date: string | null;
    harvest_date: string | null;
    yield_kg: number | null;
    rotation_score: number | null;
    status: string;
  }[];
}

export interface PlotRotationHistoryResponse {
  plot_id: string;
  plot_name: string;
  garden_name: string;
  rotations: {
    year: number;
    sequence: number;
    crop_name: string;
    planting_date: string | null;
    harvest_date: string | null;
    yield_kg: number | null;
    rotation_score: number | null;
    status: string;
  }[];
}