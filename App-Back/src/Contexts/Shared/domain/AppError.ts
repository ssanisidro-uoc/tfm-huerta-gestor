/**
 * Clase base para todos los errores de la aplicación
 * Permite manejo centralizado y consistente de errores
 */
export class AppError extends Error {
  public readonly status_code: number;
  public readonly error_code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    status_code: number,
    error_code: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.status_code = status_code;
    this.error_code = error_code;
    this.details = details;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  to_response() {
    return {
      error: this.error_code,
      message: this.message,
      status_code: this.status_code,
      timestamp: this.timestamp.toISOString(),
      ...(this.details && { details: this.details })
    };
  }
}

/**
 * Error de validación (422)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(422, 'VALIDATION_ERROR', message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(resource_type: string, identifier: string) {
    const message = `${resource_type} with identifier "${identifier}" not found`;
    super(404, 'NOT_FOUND', message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error de conflicto/duplicado (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, 'CONFLICT', message, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Error de acceso denegado (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, 'FORBIDDEN', message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Error de autenticación (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error interno del servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: Record<string, any>) {
    super(500, 'INTERNAL_SERVER_ERROR', message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Error de formato inválido (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, 'BAD_REQUEST', message, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Type guard para verificar si es AppError
 */
export function is_app_error(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard para verificar si es Error nativo
 */
export function is_error(error: unknown): error is Error {
  return error instanceof Error;
}
