import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { CreatePlotCommand } from '../../../../Contexts/Plot/application/CreatePlot/CreatePlotCommand';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

interface CreatePlotBody {
  name: string;
  code?: string;
  surface_m2: number;
  description?: string;
  length_m?: number;
  width_m?: number;
  shape?: string;
  position_x?: number;
  position_y?: number;
  plot_order?: number;
  soil_type?: string;
  soil_ph?: number;
  soil_quality?: string;
  soil_notes?: string;
  irrigation_type?: string;
  irrigation_flow_rate?: number;
  irrigation_notes?: string;
  has_water_access?: boolean;
  orientation?: string;
  sun_exposure_hours?: number;
  shade_level?: string;
  has_greenhouse?: boolean;
  has_raised_bed?: boolean;
  has_mulch?: boolean;
  accessibility?: string;
  restrictions?: string;
}

export class CreatePlotController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { gardenId } = req.params;
      const body = req.body as CreatePlotBody;

      logger.debug(
        `Creating plot in garden ${gardenId} for user ${userId}`,
        'CreatePlotController'
      );

      const command = new CreatePlotCommand(
        crypto.randomUUID(),
        gardenId,
        body.name,
        body.code ?? null,
        body.surface_m2,
        body.description ?? null,
        body.length_m ?? null,
        body.width_m ?? null,
        body.shape ?? null,
        body.position_x ?? null,
        body.position_y ?? null,
        body.plot_order ?? null,
        body.soil_type ?? null,
        body.soil_ph ?? null,
        body.soil_quality ?? null,
        body.soil_notes ?? null,
        body.irrigation_type ?? 'manual',
        body.irrigation_flow_rate ?? null,
        body.irrigation_notes ?? null,
        body.has_water_access ?? true,
        body.orientation ?? null,
        body.sun_exposure_hours ?? null,
        body.shade_level ?? null,
        body.has_greenhouse ?? false,
        body.has_raised_bed ?? false,
        body.has_mulch ?? false,
        body.accessibility ?? null,
        body.restrictions ?? null
      );

      await this.commandBus.dispatch(command);

      logger.info(`Plot created successfully in garden ${gardenId}`, 'CreatePlotController');

      res.status(201).json({
        message: 'Plot created successfully'
      });
    } catch (error: unknown) {
      logger.error('Error creating plot', error as Error, 'CreatePlotController');
      next(error);
    }
  }
}
