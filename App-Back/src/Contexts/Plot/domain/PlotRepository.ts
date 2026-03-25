import { Plot } from './Plot';

export interface PlotRepository {
  save(plot: Plot): Promise<void>;
  search_by_id(id: string): Promise<Plot | null>;
  find_by_garden(
    garden_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Plot[]>;
  count_by_garden(garden_id: string): Promise<number>;
  update(plot: Plot): Promise<void>;
  delete(id: string): Promise<void>;
}
