import { ConflictError, NotFoundError } from '../../../Shared/domain/AppError';

export class GardenNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('Garden', identifier);
    Object.setPrototypeOf(this, GardenNotFoundError.prototype);
  }
}

export class GardenNameAlreadyExistsError extends ConflictError {
  constructor(name: string, ownerId: string) {
    super(`Garden with name "${name}" already exists for owner`);
    Object.setPrototypeOf(this, GardenNameAlreadyExistsError.prototype);
  }
}

export class InvalidGardenDataError extends ConflictError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidGardenDataError.prototype);
  }
}

export class InvalidSurfaceError extends ConflictError {
  constructor(surface: number) {
    super(`Invalid surface: ${surface}. Must be greater than 0`);
    Object.setPrototypeOf(this, InvalidSurfaceError.prototype);
  }
}

export class InvalidClimateZoneError extends ConflictError {
  constructor(zone: string) {
    super(`Invalid climate zone: "${zone}"`);
    Object.setPrototypeOf(this, InvalidClimateZoneError.prototype);
  }
}

export class GardenNotOwnedError extends ConflictError {
  constructor(gardenId: string, userId: string) {
    super(`Garden ${gardenId} is not owned by user ${userId}`);
    Object.setPrototypeOf(this, GardenNotOwnedError.prototype);
  }
}
