import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from '../Logger';

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer?: string;
}

export class JwtHandler {
  private static instance: JwtHandler;
  private config: JwtConfig;
  private tokenBlacklist: Set<string> = new Set();

  constructor(config: JwtConfig) {
    this.config = config;
  }

  generate_token(payload: JwtPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: this.config.expiresIn as any,
        issuer: this.config.issuer || 'app-back'
      };

      const token = jwt.sign(payload, this.config.secret, options);

      logger.debug(`JWT token generated for user ${payload.userId}`, 'JwtHandler');
      return token;
    } catch (error: any) {
      logger.error(`Error generating JWT token: ${error.message}`, 'JwtHandler');
      throw error;
    }
  }

  verify_token(token: string): JwtPayload {
    try {
      if (this.tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.config.secret, {
        issuer: this.config.issuer || 'app-back'
      }) as JwtPayload;

      logger.debug(`JWT token verified for user ${decoded.userId}`, 'JwtHandler');
      return decoded;
    } catch (error: any) {
      logger.warn(`JWT verification failed: ${error.message}`, 'JwtHandler');
      throw error;
    }
  }

  invalidate_token(token: string): void {
    this.tokenBlacklist.add(token);
    logger.info(`Token invalidated`, 'JwtHandler');
  }

  is_token_invalidated(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  decode_token(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error: any) {
      logger.error(`Error decoding token: ${error.message}`, 'JwtHandler');
      return null;
    }
  }

  get_expiration(): string {
    return this.config.expiresIn;
  }
}
