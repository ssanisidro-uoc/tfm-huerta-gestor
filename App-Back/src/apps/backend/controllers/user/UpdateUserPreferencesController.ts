import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { UpdatePreferencesCommand } from '../../../../Contexts/User/application/UpdatePreferences/UpdatePreferencesCommand';
import { FindUserPreferencesQuery } from '../../../../Contexts/User/application/FindUserPreferences/FindUserPreferencesQuery';

export class UpdateUserPreferencesController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userid } = req.headers as { userid?: string };

      if (!userid) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      const { language, theme, notifications_enabled } = req.body;

      const command = new UpdatePreferencesCommand(
        userid,
        language,
        theme,
        notifications_enabled
      );

      await this.commandBus.dispatch(command);

      const query = new FindUserPreferencesQuery(userid);
      const result = await this.queryBus.ask(query);

      logger.info(`User ${userid} preferences updated`, 'UpdateUserPreferencesController');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error updating preferences: ${error.message}`, 'UpdateUserPreferencesController');
      next(error);
    }
  }
}