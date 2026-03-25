import { AggregateRoot } from '../../Shared/domain/AggregateRoot';
import { UserCreatedDomainEvent } from './events/UserCreatedDomainEvent';
import { UserEmail } from './UserEmail';
import { UserId } from './UserId';

export class User extends AggregateRoot {
  readonly id: UserId;
  readonly name: string;
  readonly email: UserEmail;
  readonly password: string; // Hash de contraseña
  readonly password_hash: string;
  readonly role_id: string;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(
    id: UserId,
    name: string,
    email: UserEmail,
    password: string,
    password_hash: string,
    role_id: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
  ) {
    super();
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.password_hash = password_hash;
    this.role_id = role_id;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static create(
    id: UserId,
    name: string,
    email: UserEmail,
    password: string,
    role_id: string
  ): User {
    const now: Date = new Date();
    const user: User = new User(
      id,
      name,
      email,
      password,
      password, // Inicialmente igual, será hasheado
      role_id,
      true,
      now,
      now
    );
    user.record(new UserCreatedDomainEvent(id.get_value(), email.get_value(), role_id));
    return user;
  }

  static from_persistence(raw: any): User {
    return new User(
      new UserId(raw.id),
      raw.name,
      new UserEmail(raw.email),
      raw.password,
      raw.password_hash,
      raw.role_id,
      raw.is_active,
      new Date(raw.created_at),
      new Date(raw.updated_at)
    );
  }

  to_persistence(): any {
    return {
      id: this.id.get_value(),
      name: this.name,
      email: this.email.get_value(),
      password: this.password,
      password_hash: this.password_hash,
      role_id: this.role_id,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  to_response(): any {
    return {
      id: this.id.get_value(),
      name: this.name,
      email: this.email.get_value(),
      role_id: this.role_id,
      is_active: this.is_active,
      created_at: this.created_at
    };
  }
}
