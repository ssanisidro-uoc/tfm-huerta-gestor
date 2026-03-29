import { NotFoundError } from '../../../Shared/domain/AppError';
import { InvalidArgumentError } from '../../../Shared/domain/InvalidArgumentError';

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

export class InvalidPlotNameError extends InvalidArgumentError {
  constructor(name: string) {
    super(`Plot name "${name}" is invalid. Name is required.`, { field: 'name', value: name });
    Object.setPrototypeOf(this, InvalidPlotNameError.prototype);
  }
}

export class InvalidPlotSurfaceError extends InvalidArgumentError {
  constructor(surface: number | string) {
    super(`Plot surface is invalid. Must be a positive number.`, { field: 'surface_m2', value: surface });
    Object.setPrototypeOf(this, InvalidPlotSurfaceError.prototype);
  }
}
