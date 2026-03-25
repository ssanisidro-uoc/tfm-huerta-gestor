import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { HarvestCropCommand } from '../../../../Contexts/Planting/application/Harvest/HarvestCropCommand';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';

interface HarvestCropBody {
  harvest_date: string;
  total_harvest_kg?: number;
  harvest_quality?: string;
  harvest_notes?: string;
}

export class HarvestCropController {
  constructor(
    private commandBus: CommandBus,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { planting_id } = req.params;
      const body = req.body as HarvestCropBody;

      if (!body.harvest_date) {
        res.status(400).json({ error: 'harvest_date is required' });
        return;
      }

      const plantingFinder = req.app.get('Planting.PlantingByIdFinder');
      const planting = await (plantingFinder as any).run(planting_id);
      
      if (!planting) {
        res.status(404).json({ error: 'Planting not found' });
        return;
      }

      const gardenId = planting.garden_id.get_value();
      const hasAccess = await this.userGardenRepository.has_permission(userId, gardenId, 'collaborator');
      if (!hasAccess) {
        const garden = await this.userGardenRepository.find_by_user_and_garden(userId, gardenId);
        if (!garden) {
          res.status(403).json({ error: 'You do not have access to this garden' });
          return;
        }
      }

      logger.debug(`Harvesting crop ${planting_id} by user ${userId}`, 'HarvestCropController');

      const command = new HarvestCropCommand(
        planting_id,
        userId,
        new Date(body.harvest_date),
        body.total_harvest_kg,
        body.harvest_quality,
        body.harvest_notes
      );

      await this.commandBus.dispatch(command);

      logger.info(`Crop ${planting_id} harvested and archived`, 'HarvestCropController');

      res.status(200).json({
        success: true,
        message: 'Crop harvested and archived successfully'
      });
    } catch (error: unknown) {
      logger.error('Error harvesting crop', error as Error, 'HarvestCropController');
      next(error);
    }
  }
}
