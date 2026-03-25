import { NextFunction, Request, Response } from 'express';
import { AppError, is_app_error, is_error } from '../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../Contexts/Shared/infrastructure/Logger';

/**
 * Middleware de manejo centralizado de errores
 * Captura todos los errores y los convierte en respuestas JSON consistentes
 */
export function handle_errors(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // Si ya se envió una respuesta, no hacer nada
  if (res.headersSent) {
    return;
  }

  let error: AppError;

  // Si es un AppError, usarlo directamente
  if (is_app_error(err)) {
    error = err;
  }
  // Si es un Error nativo, convertirlo a InternalServerError
  else if (is_error(err)) {
    logger.error('Unhandled error', err, 'ErrorHandler', {
      message: err.message,
      type: err.constructor.name
    });

    error = new AppError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred', {
      error_type: err.constructor.name
    });
  }
  // Si es algo más, convertirlo también
  else {
    logger.error('Unknown error type', undefined, 'ErrorHandler', {
      error: err
    });

    error = new AppError(500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
  }

  // Log del error
  logger.warn(`[${error.status_code}] ${error.error_code}: ${error.message}`, 'ErrorHandler', {
    path: req.path,
    method: req.method,
    details: error.details
  });

  // Enviar respuesta
  res.status(error.status_code).json(error.to_response());
}

/**
 * Middleware para capturar errores en rutas no encontradas
 */
export function handle_not_found(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    status_code: 404,
    timestamp: new Date().toISOString()
  });
}

/**
 * Wrapper para async route handlers
 * Convierte promesas rechazadas en llamadas a next(error)
 */
export function async_handler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
