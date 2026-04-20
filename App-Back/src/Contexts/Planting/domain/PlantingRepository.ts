import { Planting } from './Planting';

export interface PlantingRepository {
  save(planting: Planting): Promise<void>;
  search_by_id(id: string): Promise<Planting | null>;
  search_by_garden(garden_id: string): Promise<Planting[]>;
  search_by_plot(plot_id: string): Promise<Planting[]>;
  search_active_by_garden(garden_id: string): Promise<Planting[]>;
  search_active_by_plot(plot_id: string): Promise<Planting[]>;
  search_archived_by_garden(garden_id: string): Promise<Planting[]>;
  findRecentByPlot(plotId: string, limit: number): Promise<any[]>;
}
