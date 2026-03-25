import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { PostponeTaskCommand } from '../../../../Contexts/Task/application/Postpone/PostponeTaskCommand';

export class PostponeTaskController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { task_id } = req.params;
      const { postponed_until, reason } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!task_id) {
        throw new AppError(400, 'INVALID_REQUEST', 'task_id is required');
      }

      if (!postponed_until) {
        throw new AppError(400, 'INVALID_REQUEST', 'postponed_until is required');
      }

      const postponedDate = new Date(postponed_until);
      if (isNaN(postponedDate.getTime())) {
        throw new AppError(400, 'INVALID_DATE', 'postponed_until must be a valid date');
      }

      if (postponedDate <= new Date()) {
        throw new AppError(400, 'INVALID_DATE', 'postponed_until must be in the future');
      }

      const command = new PostponeTaskCommand(
        task_id,
        user.userId,
        postponedDate,
        reason
      );

      await this.commandBus.dispatch(command);

      logger.info(`Task ${task_id} postponed until ${postponedDate}`, 'PostponeTaskController');

      res.status(200).json({
        success: true,
        message: 'Task postponed successfully'
      });
    } catch (error: any) {
      logger.error(`Error postponing task: ${error.message}`, 'PostponeTaskController');
      next(error);
    }
  }
}
