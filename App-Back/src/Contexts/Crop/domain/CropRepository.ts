import { Crop } from './Crop';

export interface CropRepository {
  search_by_id(id: string): Promise<Crop | null>;
  search_all(options?: {
    page: number;
    limit: number;
    offset: number;
    filters?: { category?: string; family?: string; search?: string };
  }): Promise<Crop[]>;
  search_by_family(family: string): Promise<Crop[]>;
  count(filters?: { category?: string; family?: string; search?: string }): Promise<number>;
  save(crop: Crop): Promise<void>;
  delete(id: string): Promise<void>;
  findByNameOrScientific(name: string, scientificName?: string, excludeId?: string): Promise<{ exists: boolean; field: string } | null>;
}
