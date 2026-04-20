import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { UserSessionId } from './UserSessionId';

export interface UserSessionProps {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  expires_at: Date;
  created_at: Date;
  last_activity_at: Date;
}

export class UserSession extends AggregateRoot {
  readonly id: UserSessionId;
  readonly user_id: string;
  readonly token_hash: string;
  readonly ip_address: string | null;
  readonly user_agent: string | null;
  readonly is_active: boolean;
  readonly expires_at: Date;
  readonly created_at: Date;
  readonly last_activity_at: Date;

  constructor(
    id: UserSessionId,
    user_id: string,
    token_hash: string,
    ip_address: string | null,
    user_agent: string | null,
    is_active: boolean,
    expires_at: Date,
    created_at: Date,
    last_activity_at: Date
  ) {
    super();
    this.id = id;
    this.user_id = user_id;
    this.token_hash = token_hash;
    this.ip_address = ip_address;
    this.user_agent = user_agent;
    this.is_active = is_active;
    this.expires_at = expires_at;
    this.created_at = created_at;
    this.last_activity_at = last_activity_at;
  }

  static create(
    user_id: string,
    token_hash: string,
    ip_address: string | null,
    user_agent: string | null,
    expires_at: Date
  ): UserSession {
    const now = new Date();
    return new UserSession(
      UserSessionId.create_random(),
      user_id,
      token_hash,
      ip_address,
      user_agent,
      true,
      expires_at,
      now,
      now
    );
  }

  static from_persistence(raw: UserSessionProps): UserSession {
    return new UserSession(
      new UserSessionId(raw.id),
      raw.user_id,
      raw.token_hash,
      raw.ip_address,
      raw.user_agent,
      raw.is_active,
      new Date(raw.expires_at),
      new Date(raw.created_at),
      new Date(raw.last_activity_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      user_id: this.user_id,
      token_hash: this.token_hash,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      is_active: this.is_active,
      expires_at: this.expires_at,
      created_at: this.created_at,
      last_activity_at: this.last_activity_at
    };
  }

  to_response(): any {
    return {
      id: this.id.get_value(),
      user_id: this.user_id,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      is_active: this.is_active,
      expires_at: this.expires_at,
      created_at: this.created_at,
      last_activity_at: this.last_activity_at
    };
  }
}