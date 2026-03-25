import { JwtHandler, JwtConfig } from './auth/JwtHandler';
import config from './config/index';

export class JwtHandlerFactory {
  static create(): JwtHandler {
    const jwtConfig: JwtConfig = {
      secret: config.get('jwt.secret'),
      expiresIn: config.get('jwt.expiresIn'),
      issuer: config.get('jwt.issuer')
    };
    return new JwtHandler(jwtConfig);
  }
}
