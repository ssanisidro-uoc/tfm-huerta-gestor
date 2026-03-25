import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { DeleteManualTaskCommand } from '../../../../Contexts/Task/application/DeleteManualTask/DeleteManualTaskCommand';

export class DeleteManualTaskController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { task_id } = req.params;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!task_id) {
        throw new AppError(400, 'INVALID_REQUEST', 'task_id is required');
      }

      const command = new DeleteManualTaskCommand(task_id, user.userId);

      await this.commandBus.dispatch(command);

      logger.info(`Task ${task_id} deleted by ${user.userId}`, 'DeleteManualTaskController');

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      logger.error(`Error deleting task: ${error.message}`, 'DeleteManualTaskController');
      next(error);
    }
  }
}
