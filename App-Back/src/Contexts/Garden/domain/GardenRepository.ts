import { Garden } from './Garden';

export interface GardenRepository {
  save(garden: Garden): Promise<void>;
  search_by_id(id: string): Promise<Garden | null>;
  search_by_owner(
    owner_id: string,
    options?: { page: number; limit: number; offset: number }
  ): Promise<Garden[]>;
  find_by_owner(owner_id: string, options?: { page: number; limit: number; offset: number }): Promise<Garden[]>;
  count_by_owner(owner_id: string): Promise<number>;
  update(garden: Garden): Promise<void>;
  delete(id: string): Promise<void>;
}
