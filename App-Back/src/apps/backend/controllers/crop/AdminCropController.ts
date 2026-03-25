import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { ManageCropCommand } from '../../../../Contexts/Crop/application/Manage/ManageCropCommand';
import { DeleteCropCommand } from '../../../../Contexts/Crop/application/Delete/DeleteCropCommand';

interface CropBody {
  name: string;
  scientific_name: string;
  family: string;
  days_to_maturity: number;
  min_temperature: number;
  max_temperature: number;
}

export class AdminCropController {
  constructor(private commandBus: CommandBus) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (userRole !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const body = req.body as CropBody;

      if (!body.name || !body.family || !body.days_to_maturity) {
        res.status(400).json({ error: 'name, family, and days_to_maturity are required' });
        return;
      }

      logger.debug(`Creating crop ${body.name} by admin ${userId}`, 'AdminCropController');

      const command = new ManageCropCommand(
        body.name,
        body.scientific_name || '',
        body.family,
        body.days_to_maturity,
        body.min_temperature || 0,
        body.max_temperature || 40,
        userId
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
      const userId = req.user?.userId;
      const userRole = req.user?.role;

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

      if (!body.name || !body.family || !body.days_to_maturity) {
        res.status(400).json({ error: 'name, family, and days_to_maturity are required' });
        return;
      }

      logger.debug(`Updating crop ${crop_id} by admin ${userId}`, 'AdminCropController');

      const command = new ManageCropCommand(
        body.name,
        body.scientific_name || '',
        body.family,
        body.days_to_maturity,
        body.min_temperature || 0,
        body.max_temperature || 40,
        userId,
        crop_id
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
      const userId = req.user?.userId;
      const userRole = req.user?.role;

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
