import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../../../Contexts/Shared/domain/AppError';

export function handle_validation_errors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const grouped_errors: { [key: string]: string[] } = {};

    errors.array().forEach((error: any) => {
      const field = error.path || error.param;
      if (!grouped_errors[field]) {
        grouped_errors[field] = [];
      }
      grouped_errors[field].push(error.msg);
    });

    const error = new ValidationError('Validation failed', { errors: grouped_errors });
    return next(error);
  }

  next();
}
