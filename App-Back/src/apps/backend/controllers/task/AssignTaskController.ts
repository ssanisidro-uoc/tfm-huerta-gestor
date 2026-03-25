import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { AssignTaskCommand } from '../../../../Contexts/Task/application/Assign/AssignTaskCommand';

export class AssignTaskController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { task_id } = req.params;
      const { assigned_to } = req.body;

      if (!assigned_to) {
        res.status(400).json({ error: 'assigned_to is required' });
        return;
      }

      logger.debug(`Assigning task ${task_id} to ${assigned_to} by user ${userId}`, 'AssignTaskController');

      const command = new AssignTaskCommand(task_id, assigned_to, userId);
      await this.commandBus.dispatch(command);

      logger.info(`Task ${task_id} assigned to ${assigned_to}`, 'AssignTaskController');

      res.status(200).json({
        success: true,
        message: 'Task assigned successfully'
      });
    } catch (error: unknown) {
      logger.error('Error assigning task', error as Error, 'AssignTaskController');
      next(error);
    }
  }
}
