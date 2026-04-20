import { User } from './User';

export interface UserRepository {
  save(user: User): Promise<void>;
  search_by_id(id: string): Promise<User | null>;
  search_all(options?: {
    page: number;
    limit: number;
    offset: number;
    filters?: { is_active?: boolean; role_id?: string };
  }): Promise<User[]>;
  search_by_email(email: string): Promise<User | null>;
  find_by_email(email: string): Promise<User | null>;
  find_role_id_by_name(name: string): Promise<string | null>;
  count(filters?: { is_active?: boolean; role_id?: string }): Promise<number>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
