import { NotFoundError } from '../../../Shared/domain/AppError';

export class PlantingNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('Planting', identifier);
    Object.setPrototypeOf(this, PlantingNotFoundError.prototype);
  }
}

export class PlantingAlreadyExistsError extends Error {
  constructor(cropId: string, gardenId: string, plotId: string) {
    super(`Planting already exists for crop ${cropId} in plot ${plotId}`);
    Object.setPrototypeOf(this, PlantingAlreadyExistsError.prototype);
  }
}

export class InvalidPlantingDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidPlantingDataError.prototype);
  }
}

export class InvalidHarvestDateError extends Error {
  constructor(plantedAt: Date, harvestAt: Date) {
    super(`Harvest date ${harvestAt} must be after planting date ${plantedAt}`);
    Object.setPrototypeOf(this, InvalidHarvestDateError.prototype);
  }
}

export class PlantingNotOwnedError extends Error {
  constructor(plantingId: string, userId: string) {
    super(`Planting ${plantingId} is not owned by user ${userId}`);
    Object.setPrototypeOf(this, PlantingNotOwnedError.prototype);
  }
}
