import { NextFunction, Request, Response } from 'express';
import { UpdateGardenCommand } from '../../../../Contexts/Garden/application/Update/UpdateGardenCommand';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

interface UpdateGardenBody {
  name?: string;
  description?: string | null;
  surface_m2?: number | null;
  climate_zone?: string;
  hardiness_zone?: string | null;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  } | null;
  is_active?: boolean;
}

export class UpdateGardenController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const body = req.body as UpdateGardenBody;

      logger.debug(`Updating garden ${id} for user ${userId}`, 'UpdateGardenController');

      const command = new UpdateGardenCommand(id, body);
      await this.commandBus.dispatch(command);

      logger.info(`Garden ${id} updated successfully`, 'UpdateGardenController');

      res.status(200).json({
        message: 'Garden updated successfully'
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'GARDEN_NOT_FOUND', err.message));
      } else {
        logger.error('Error updating garden', err, 'UpdateGardenController');
        next(error);
      }
    }
  }
}
