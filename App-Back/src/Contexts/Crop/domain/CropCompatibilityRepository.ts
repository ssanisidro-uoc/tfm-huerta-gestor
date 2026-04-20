import { CropCompatibility } from '../domain/CropCompatibility/CropCompatibility';

export interface CropCompatibilityRepository {
  save(compatibility: CropCompatibility): Promise<void>;
  search_by_id(id: string): Promise<CropCompatibility | null>;
  find_by_crop_id(crop_catalog_id: string): Promise<CropCompatibility[]>;
  find_companions(crop_catalog_id: string): Promise<CropCompatibility[]>;
  find_incompatibilities(crop_catalog_id: string): Promise<CropCompatibility[]>;
  find_all(options?: { page: number; limit: number }): Promise<CropCompatibility[]>;
  update(compatibility: CropCompatibility): Promise<void>;
  delete(id: string): Promise<void>;
}