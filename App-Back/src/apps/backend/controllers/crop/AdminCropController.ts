import { NextFunction, Request, Response } from 'express';
import { DeleteCropCommand } from '../../../../Contexts/Crop/application/Delete/DeleteCropCommand';
import { ManageCropCommand } from '../../../../Contexts/Crop/application/Manage/ManageCropCommand';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

interface CropBody {
  name: string;
  scientific_name: string;
  family: string;
  category: string;
  days_to_harvest_min: number;
  days_to_harvest_max: number;
  min_temperature_c?: number;
  max_temperature_c?: number;
  sun_requirement?: string;
  water_requirement?: string;
}

export class AdminCropController {
  constructor(private commandBus: CommandBus) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (userRole !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const body = req.body as CropBody;

      if (!body.name || !body.family || !body.category || !body.days_to_harvest_min || !body.days_to_harvest_max) {
        res.status(400).json({ error: 'name, family, category, days_to_harvest_min, and days_to_harvest_max are required' });
        return;
      }

      logger.debug(`Creating crop ${body.name} by admin ${userId}`, 'AdminCropController');

      const command = new ManageCropCommand(
        body.name,
        body.scientific_name || '',
        body.family,
        body.category,
        body.days_to_harvest_min,
        body.days_to_harvest_max,
        userId,
        undefined,
        body.min_temperature_c,
        body.max_temperature_c,
        body.sun_requirement,
        body.water_requirement
      );

      await this.commandBus.dispatch(command);

      logger.info(`Crop ${body.name} created by admin ${userId}`, 'AdminCropController');

      res.status(201).json({
        success: true,
        message: 'Crop created successfully'
      });
    } catch (error: unknown) {
      logger.error('Error creating crop', error as Error, 'AdminCropController');
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (userRole !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { crop_id } = req.params;
      const body = req.body as CropBody;

      if (!body.name || !body.family || !body.category || !body.days_to_harvest_min || !body.days_to_harvest_max) {
        res.status(400).json({ error: 'name, family, category, days_to_harvest_min, and days_to_harvest_max are required' });
        return;
      }

      logger.debug(`Updating crop ${crop_id} by admin ${userId}`, 'AdminCropController');

      const command = new ManageCropCommand(
        body.name,
        body.scientific_name || '',
        body.family,
        body.category,
        body.days_to_harvest_min,
        body.days_to_harvest_max,
        userId,
        crop_id,
        body.min_temperature_c,
        body.max_temperature_c,
        body.sun_requirement,
        body.water_requirement
      );

      await this.commandBus.dispatch(command);

      logger.info(`Crop ${crop_id} updated by admin ${userId}`, 'AdminCropController');

      res.status(200).json({
        success: true,
        message: 'Crop updated successfully'
      });
    } catch (error: unknown) {
      logger.error('Error updating crop', error as Error, 'AdminCropController');
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (userRole !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { crop_id } = req.params;

      logger.debug(`Deleting crop ${crop_id} by admin ${userId}`, 'AdminCropController');

      const command = new DeleteCropCommand(crop_id, userId);
      await this.commandBus.dispatch(command);

      logger.info(`Crop ${crop_id} deleted by admin ${userId}`, 'AdminCropController');

      res.status(200).json({
        success: true,
        message: 'Crop deleted successfully'
      });
    } catch (error: unknown) {
      logger.error('Error deleting crop', error as Error, 'AdminCropController');
      next(error);
    }
  }
}
