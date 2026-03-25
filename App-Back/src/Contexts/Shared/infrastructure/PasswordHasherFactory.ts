import { PasswordHasher, PasswordHasherConfig } from './auth/PasswordHasher';

export class PasswordHasherFactory {
  static create(config?: PasswordHasherConfig): PasswordHasher {
    return PasswordHasher.get_instance(config);
  }
}