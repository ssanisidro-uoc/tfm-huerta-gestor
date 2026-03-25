import bcrypt from 'bcrypt';
import { logger } from '../Logger';

export interface PasswordHasherConfig {
  saltRounds?: number;
}

export class PasswordHasher {
  private static instance: PasswordHasher;
  private saltRounds: number;

  private constructor(config: PasswordHasherConfig = {}) {
    this.saltRounds = config.saltRounds || 10;
  }

  static get_instance(config?: PasswordHasherConfig): PasswordHasher {
    if (!PasswordHasher.instance) {
      PasswordHasher.instance = new PasswordHasher(config);
    }
    return PasswordHasher.instance;
  }

  async hash_password(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      logger.debug('Password hashed successfully', 'PasswordHasher');
      return hash;
    } catch (error: any) {
      logger.error(`Error hashing password: ${error.message}`, 'PasswordHasher');
      throw error;
    }
  }

  async compare_password(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      if (isValid) {
        logger.debug('Password validation successful', 'PasswordHasher');
      } else {
        logger.warn('Password validation failed - incorrect password', 'PasswordHasher');
      }
      return isValid;
    } catch (error: any) {
      logger.error(`Error comparing password: ${error.message}`, 'PasswordHasher');
      throw error;
    }
  }

  async rehash_password(password: string): Promise<string> {
    return this.hash_password(password);
  }
}
