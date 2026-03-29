import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../Contexts/Shared/infrastructure/Logger';
import {
  JwtHandler,
  JwtPayload
} from '../../../Contexts/Shared/infrastructure/auth/JwtHandler';
import container from '../dependency-injection';

/**
 * Extender interfaz Request para incluir datos de usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticación - Valida JWT token
 */
export const require_auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', 'RequireAuthMiddleware');
      throw new AppError(401, 'AUTH_MISSING_TOKEN', 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const jwtHandler: JwtHandler = container.get('Backend.Shared.JwtHandler');
    const payload = jwtHandler.verify_token(token);

    req.user = payload;
    logger.debug(`User authenticated: ${payload.userId}`, 'RequireAuthMiddleware');

    next();
  } catch (error: any) {
    logger.error(`Authentication failed: ${error.message}`, 'RequireAuthMiddleware');

    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'AUTH_INVALID_TOKEN', 'Invalid or expired token'));
    }
  }
};

/**
 * Middleware de autorización - Valida que el usuario tenga el rol requerido
 */
export const require_role =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.warn('User not authenticated', 'RequireRoleMiddleware');
        throw new AppError(401, 'AUTH_NOT_AUTHENTICATED', 'User not authenticated');
      }

      const userRole = req.user.role || 'user';

      if (!roles.includes(userRole)) {
        logger.warn(
          `User ${req.user.userId} lacks required role. Required: ${roles.join(
            ', '
          )}, Got: ${userRole}`,
          'RequireRoleMiddleware'
        );
        throw new AppError(
          403,
          'AUTH_INSUFFICIENT_PERMISSIONS',
          `User role '${userRole}' is not permitted. Required roles: ${roles.join(', ')}`
        );
      }

      logger.debug(
        `User ${req.user.userId} authorized for role ${userRole}`,
        'RequireRoleMiddleware'
      );
      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * Middleware opcional de autenticación - No falla si no hay token, pero lo valida si existe
 */
export const optional_auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.debug('No authorization header provided (optional)', 'OptionalAuthMiddleware');
      next();
      return;
    }

    const token = authHeader.substring(7);
    const jwtHandler: JwtHandler = container.get('Backend.Shared.JwtHandler');

    try {
      const payload = jwtHandler.verify_token(token);
      req.user = payload;
      logger.debug(`User authenticated (optional): ${payload.userId}`, 'OptionalAuthMiddleware');
    } catch (error: any) {
      logger.warn(`Token validation failed (optional): ${error.message}`, 'OptionalAuthMiddleware');
      // No hacer nada, continuar sin autenticación
    }

    next();
  } catch (error) {
    logger.error(`Unexpected error in optional auth: ${error}`, 'OptionalAuthMiddleware');
    next();
  }
};
