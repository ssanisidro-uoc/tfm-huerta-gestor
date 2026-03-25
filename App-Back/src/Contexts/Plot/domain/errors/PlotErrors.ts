import { NotFoundError } from '../../../Shared/domain/AppError';

export class PlotNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super('Plot', identifier);
    Object.setPrototypeOf(this, PlotNotFoundError.prototype);
  }
}

export class PlotAlreadyExistsError extends Error {
  constructor(name: string, gardenId: string) {
    super(`Plot with name "${name}" already exists in garden`);
    Object.setPrototypeOf(this, PlotAlreadyExistsError.prototype);
  }
}

export class InvalidPlotDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidPlotDataError.prototype);
  }
}

export class InvalidSurfaceError extends Error {
  constructor(surface: number) {
    super(`Invalid surface: ${surface}. Must be greater than 0`);
    Object.setPrototypeOf(this, InvalidSurfaceError.prototype);
  }
}

export class PlotNotOwnedError extends Error {
  constructor(plotId: string, gardenId: string) {
    super(`Plot ${plotId} does not belong to garden ${gardenId}`);
    Object.setPrototypeOf(this, PlotNotOwnedError.prototype);
  }
}
