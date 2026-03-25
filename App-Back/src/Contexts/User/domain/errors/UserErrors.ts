import { ConflictError, NotFoundError } from '../../../Shared/domain/AppError';

export class UserNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('User', identifier);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    Object.setPrototypeOf(this, EmailAlreadyExistsError.prototype);
  }
}

export class InvalidEmailFormatError extends ConflictError {
  constructor(email: string) {
    super(`Invalid email format: "${email}"`, { email });
    Object.setPrototypeOf(this, InvalidEmailFormatError.prototype);
  }
}

export class InvalidUserIdError extends ConflictError {
  constructor(id: string) {
    super(`Invalid user ID format: "${id}"`, { id });
    Object.setPrototypeOf(this, InvalidUserIdError.prototype);
  }
}

export class InvalidPasswordHashError extends ConflictError {
  constructor() {
    super('Invalid password hash format. Must be at least 60 characters');
    Object.setPrototypeOf(this, InvalidPasswordHashError.prototype);
  }
}

export class InvalidRoleError extends ConflictError {
  constructor(role: string, valid_roles: string[]) {
    super(`Invalid role: "${role}". Valid roles are: ${valid_roles.join(', ')}`, {
      provided_role: role,
      valid_roles
    });
    Object.setPrototypeOf(this, InvalidRoleError.prototype);
  }
}
