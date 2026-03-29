import { ConflictError, NotFoundError } from '../../../Shared/domain/AppError';
import { InvalidArgumentError } from '../../../Shared/domain/InvalidArgumentError';

const VALID_COUNTRIES = ['ES', 'PT', 'FR', 'IT', 'MA', 'AR', 'CL', 'MX', 'CO', 'PE', 'UY'];

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

export class InvalidGardenNameError extends InvalidArgumentError {
  constructor(name: string) {
    super(`Garden name "${name}" is invalid. Name must be at least 2 characters.`, { field: 'name', value: name });
    Object.setPrototypeOf(this, InvalidGardenNameError.prototype);
  }
}

export class InvalidGardenCountryCodeError extends InvalidArgumentError {
  constructor(code: string) {
    super(`Invalid country code: "${code}". Valid codes: ${VALID_COUNTRIES.join(', ')}`, { 
      field: 'country', 
      value: code,
      valid_codes: VALID_COUNTRIES
    });
    Object.setPrototypeOf(this, InvalidGardenCountryCodeError.prototype);
  }
}

export class InvalidGardenSurfaceError extends InvalidArgumentError {
  constructor(surface: number) {
    super(`Garden surface "${surface}" is invalid. Surface must be a positive number.`, { field: 'surface_m2', value: surface });
    Object.setPrototypeOf(this, InvalidGardenSurfaceError.prototype);
  }
}
