import { Crop } from './Crop';

export interface CropRepository {
  search_by_id(id: string): Promise<Crop | null>;
  search_all(options?: {
    page: number;
    limit: number;
    offset: number;
    filters?: { category?: string; family?: string };
  }): Promise<Crop[]>;
  search_by_family(family: string): Promise<Crop[]>;
  count(filters?: { category?: string; family?: string }): Promise<number>;
  save(crop: Crop): Promise<void>;
  delete(id: string): Promise<void>;
}
