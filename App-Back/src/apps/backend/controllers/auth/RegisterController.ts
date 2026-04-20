import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CreateUserCommand } from '../../../../Contexts/User/application/Create/CreateUserCommand';
import { PasswordHasher } from '../../../../Contexts/Shared/infrastructure/auth/PasswordHasher';
import { JwtHandler, JwtPayload } from '../../../../Contexts/Shared/infrastructure/auth/JwtHandler';
import { UserId } from '../../../../Contexts/User/domain/UserId';
import { UserRepository } from '../../../../Contexts/User/domain/UserRepository';
import crypto from 'crypto';

export class RegisterController {
  constructor(
    private commandBus: CommandBus,
    private passwordHasher: PasswordHasher,
    private jwtHandler: JwtHandler,
    private userRepository: UserRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      logger.debug('Registering user', 'RegisterController', { email });

      const password_hash = await this.passwordHasher.hash_password(password);
      const id = crypto.randomUUID();

      const role_id = await this.userRepository.find_role_id_by_name('user');
      if (!role_id) {
        throw new Error('Role "user" not found in database');
      }

      const command = new CreateUserCommand(id, name, email, password_hash, role_id);

      await this.commandBus.dispatch(command);

      const token = this.jwtHandler.generate_token({
        userId: id,
        email,
        role: 'user'
      });

      logger.info('User registered successfully', 'RegisterController', { email });

      res.status(201).json({
        success: true,
        data: {
          token,
          user: { id, name, email }
        }
      });
    } catch (error: any) {
      logger.error('Error registering user', error, 'RegisterController');
      next(error);
    }
  }
}
