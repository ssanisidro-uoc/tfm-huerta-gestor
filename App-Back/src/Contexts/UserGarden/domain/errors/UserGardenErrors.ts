import { ConflictError, NotFoundError } from '../../../Shared/domain/AppError';

export class UserGardenNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('UserGarden', identifier);
    Object.setPrototypeOf(this, UserGardenNotFoundError.prototype);
  }
}

export class UserGardenAlreadyExistsError extends ConflictError {
  constructor(userId: string, gardenId: string) {
    super(`User ${userId} already has access to garden ${gardenId}`);
    Object.setPrototypeOf(this, UserGardenAlreadyExistsError.prototype);
  }
}

export class InvalidGardenRoleError extends ConflictError {
  constructor(role: string) {
    const validRoles = ['owner', 'manager', 'collaborator', 'viewer'];
    super(`Invalid garden role: "${role}". Valid roles are: ${validRoles.join(', ')}`);
    Object.setPrototypeOf(this, InvalidGardenRoleError.prototype);
  }
}

export class UserGardenAccessDeniedError extends ConflictError {
  constructor(userId: string, gardenId: string, requiredRole: string) {
    super(`User ${userId} does not have ${requiredRole} access to garden ${gardenId}`);
    Object.setPrototypeOf(this, UserGardenAccessDeniedError.prototype);
  }
}

export class CannotRemoveOwnerError extends ConflictError {
  constructor(gardenId: string) {
    super(`Cannot remove owner access from garden ${gardenId}`);
    Object.setPrototypeOf(this, CannotRemoveOwnerError.prototype);
  }
}
