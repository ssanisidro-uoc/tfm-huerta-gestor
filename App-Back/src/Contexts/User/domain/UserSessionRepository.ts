import { UserSession } from './UserSession/UserSession';

export interface UserSessionRepository {
  save(session: UserSession): Promise<void>;
  find_by_token_hash(token_hash: string): Promise<UserSession | null>;
  find_active_by_user_id(user_id: string): Promise<UserSession[]>;
  update(session: UserSession): Promise<void>;
  delete(id: string): Promise<void>;
  delete_expired(): Promise<void>;
  delete_old_sessions(user_id: string, keep_count: number): Promise<void>;
}