import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CancelTaskCommand } from '../../../../Contexts/Task/application/Cancel/CancelTaskCommand';

export class CancelTaskController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { task_id } = req.params;
      const { cancellation_reason } = req.body;

      if (!cancellation_reason) {
        res.status(400).json({ error: 'cancellation_reason is required' });
        return;
      }

      logger.debug(`Cancelling task ${task_id} by user ${userId}`, 'CancelTaskController');

      const command = new CancelTaskCommand(task_id, userId, cancellation_reason);
      await this.commandBus.dispatch(command);

      logger.info(`Task ${task_id} cancelled successfully`, 'CancelTaskController');

      res.status(200).json({
        success: true,
        message: 'Task cancelled successfully'
      });
    } catch (error: unknown) {
      logger.error('Error cancelling task', error as Error, 'CancelTaskController');
      next(error);
    }
  }
}
