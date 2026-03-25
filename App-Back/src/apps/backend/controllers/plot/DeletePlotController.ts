import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { DeletePlotCommand } from '../../../../Contexts/Plot/application/DeletePlot/DeletePlotCommand';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class DeletePlotController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      logger.debug(`Deleting plot ${id}`, 'DeletePlotController');

      const command = new DeletePlotCommand(id);
      await this.commandBus.dispatch(command);

      logger.info(`Plot ${id} deleted successfully`, 'DeletePlotController');

      res.status(200).json({ message: 'Plot deleted successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'PLOT_NOT_FOUND', err.message));
      } else {
        logger.error('Error deleting plot', err, 'DeletePlotController');
        next(error);
      }
    }
  }
}
