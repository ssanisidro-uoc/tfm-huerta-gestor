import { NotFoundError } from '../../../Shared/domain/AppError';

export class CropNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('Crop', identifier);
    Object.setPrototypeOf(this, CropNotFoundError.prototype);
  }
}

export class CropAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Crop with name "${name}" already exists`);
    Object.setPrototypeOf(this, CropAlreadyExistsError.prototype);
  }
}

export class InvalidCropDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidCropDataError.prototype);
  }
}

export class InvalidTemperatureRangeError extends Error {
  constructor(min: number, max: number) {
    super(`Invalid temperature range: min ${min}°C must be less than max ${max}°C`);
    Object.setPrototypeOf(this, InvalidTemperatureRangeError.prototype);
  }
}
