import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CompleteTaskCommand } from '../../../../Contexts/Task/application/Complete/CompleteTaskCommand';

export class CompleteTaskController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { task_id } = req.params;
      const { completion_notes, actual_duration_minutes } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!task_id) {
        throw new AppError(400, 'INVALID_REQUEST', 'task_id is required');
      }

      const command = new CompleteTaskCommand(
        task_id,
        user.userId,
        completion_notes,
        actual_duration_minutes
      );

      await this.commandBus.dispatch(command);

      logger.info(`Task ${task_id} completed by ${user.userId}`, 'CompleteTaskController');

      res.status(200).json({
        success: true,
        message: 'Task completed successfully'
      });
    } catch (error: any) {
      logger.error(`Error completing task: ${error.message}`, 'CompleteTaskController');
      next(error);
    }
  }
}
