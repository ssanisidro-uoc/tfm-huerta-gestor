import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { UpdatePlotCommand } from '../../../../Contexts/Plot/application/UpdatePlot/UpdatePlotCommand';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

interface UpdatePlotBody {
  name?: string;
  code?: string | null;
  description?: string | null;
  surface_m2?: number;
  length_m?: number | null;
  width_m?: number | null;
  shape?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  plot_order?: number | null;
  soil_type?: string | null;
  soil_ph?: number | null;
  soil_quality?: string | null;
  soil_notes?: string | null;
  irrigation_type?: string;
  irrigation_flow_rate?: number | null;
  irrigation_notes?: string | null;
  has_water_access?: boolean;
  orientation?: string | null;
  sun_exposure_hours?: number | null;
  shade_level?: string | null;
  has_greenhouse?: boolean;
  has_raised_bed?: boolean;
  has_mulch?: boolean;
  accessibility?: string | null;
  restrictions?: string | null;
  is_active?: boolean;
}

export class UpdatePlotController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const body = req.body as UpdatePlotBody;

      logger.debug(`Updating plot ${id}`, 'UpdatePlotController');

      const command = new UpdatePlotCommand(id, body);
      await this.commandBus.dispatch(command);

      logger.info(`Plot ${id} updated successfully`, 'UpdatePlotController');

      res.status(200).json({ message: 'Plot updated successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        next(new AppError(404, 'PLOT_NOT_FOUND', err.message));
      } else {
        logger.error('Error updating plot', err, 'UpdatePlotController');
        next(error);
      }
    }
  }
}
