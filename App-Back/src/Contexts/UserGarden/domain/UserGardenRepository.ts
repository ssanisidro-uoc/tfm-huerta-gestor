import { UserGarden } from './UserGarden';

export interface UserGardenRepository {
  save(userGarden: UserGarden): Promise<void>;
  search_by_id(id: string): Promise<UserGarden | null>;
  find_by_user_and_garden(user_id: string, garden_id: string): Promise<UserGarden | null>;
  find_by_user(user_id: string): Promise<UserGarden[]>;
  find_by_garden(garden_id: string): Promise<UserGarden[]>;
  update(userGarden: UserGarden): Promise<void>;
  delete(id: string): Promise<void>;
  delete_by_user_and_garden(user_id: string, garden_id: string): Promise<void>;
}
