import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CreatePlantingCommand } from '../../../../Contexts/Planting/application/Create/CreatePlantingCommand';

export class CreatePlantingController {
  constructor(private commandBus: CommandBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const { crop_id, plot_id, garden_id, planted_at, quantity, unit, variety } = req.body;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!crop_id || !plot_id || !garden_id || !planted_at) {
        throw new AppError(400, 'INVALID_REQUEST', 'crop_id, plot_id, garden_id and planted_at are required');
      }

      const plantedDate = new Date(planted_at);
      const harvestDate = new Date(plantedDate);
      harvestDate.setDate(harvestDate.getDate() + (req.body.days_to_maturity || 90));

      const command = new CreatePlantingCommand(
        crypto.randomUUID(),
        crop_id,
        garden_id,
        plot_id,
        plantedDate,
        harvestDate,
        quantity || 1,
        unit || 'plants'
      );

      await this.commandBus.dispatch(command);

      logger.info(`Planting created: ${command.id}`, 'CreatePlantingController');

      res.status(201).json({
        success: true,
        data: {
          id: command.id,
          crop_id: command.crop_id,
          garden_id: command.garden_id,
          plot_id: command.plot_id,
          planted_at: command.planted_at,
          expected_harvest_at: command.expected_harvest_at,
          quantity: command.quantity,
          unit: command.unit,
          status: 'planted'
        }
      });
    } catch (error: any) {
      logger.error(`Error creating planting: ${error.message}`, 'CreatePlantingController');
      next(error);
    }
  }
}
