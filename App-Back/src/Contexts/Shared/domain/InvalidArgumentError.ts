import { BadRequestError } from './AppError';

export class InvalidArgumentError extends BadRequestError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}
