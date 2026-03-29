import { NextFunction, Request, Response } from 'express';
import { DeleteGardenCommand } from '../../../../Contexts/Garden/application/Delete/DeleteGardenCommand';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class DeleteGardenController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      logger.debug(`Deleting garden ${id} for user ${userId}`, 'DeleteGardenController');

      const command = new DeleteGardenCommand(id);
      await this.commandBus.dispatch(command);

      logger.info(`Garden ${id} deleted successfully`, 'DeleteGardenController');

      res.status(200).json({
        message: 'Garden deleted successfully'
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'GARDEN_NOT_FOUND', err.message));
      } else {
        logger.error('Error deleting garden', err, 'DeleteGardenController');
        next(error);
      }
    }
  }
}
