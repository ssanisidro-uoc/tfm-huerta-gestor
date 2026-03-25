import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CreateUserCommand } from '../../../../Contexts/User/application/Create/CreateUserCommand';
import { PasswordHasher } from '../../../../Contexts/Shared/infrastructure/auth/PasswordHasher';

export class CreateUserController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, name, email, password, role_id } = req.body;

      logger.debug('Creating user', 'CreateUserController', { email, role_id });

      const hasher = PasswordHasher.get_instance();
      const password_hash = await hasher.hash_password(password);

      const command: CreateUserCommand = new CreateUserCommand(
        id,
        name,
        email,
        password_hash,
        role_id
      );
      await this.commandBus.dispatch(command);

      logger.info('User created successfully', 'CreateUserController', { id, email });

      res.status(201).json({
        message: 'User created successfully',
        id,
        email
      });
    } catch (error) {
      logger.error('Error creating user', error, 'CreateUserController', {
        email: req.body?.email
      });
      next(error);
    }
  }
}
