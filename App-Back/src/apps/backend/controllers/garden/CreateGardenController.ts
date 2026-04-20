import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { CreateGardenCommand } from '../../../../Contexts/Garden/application/Create/CreateGardenCommand';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

interface CreateGardenBody {
  name: string;
  description?: string;
  surface_m2?: number;
  climate_zone: string;
  hardiness_zone?: string;
  location: {
    address?: string;
    city: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
}

export class CreateGardenController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const body = req.body as CreateGardenBody;

      logger.debug(`Creating garden for user ${userId}`, 'CreateGardenController');

      if (!body.location?.city) {
        res.status(400).json({ error: 'City is required' });
        return;
      }

      const command = new CreateGardenCommand(
        crypto.randomUUID(),
        userId,
        body.name,
        body.description ?? null,
        body.surface_m2 ?? null,
        body.climate_zone,
        body.hardiness_zone ?? null,
        body.location
      );

      await this.commandBus.dispatch(command);

      logger.info(`Garden created successfully by user ${userId}`, 'CreateGardenController');

      res.status(201).json({
        message: 'Garden created successfully'
      });
    } catch (error: unknown) {
      logger.error('Error creating garden', error as Error, 'CreateGardenController');
      next(error);
    }
  }
}
