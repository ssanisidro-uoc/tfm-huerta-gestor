import { NextFunction, Request, Response } from 'express';
import { WeatherService } from '../../../../Contexts/Weather/application/WeatherService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class SyncWeatherController {
  constructor(private weatherService: WeatherService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location_id } = req.params;
      const user = (req as any).user;

      if (!user) {
        throw new AppError(401, 'AUTH_UNAUTHORIZED', 'User not authenticated');
      }

      if (!location_id) {
        throw new AppError(400, 'MISSING_LOCATION', 'location_id is required');
      }

      await this.weatherService.syncWeatherData(location_id);

      logger.info(`Weather data synced for location ${location_id}`, 'SyncWeatherController');

      res.status(200).json({
        success: true,
        message: 'Weather data synced successfully'
      });
    } catch (error: any) {
      logger.error(`Error syncing weather data: ${error.message}`, 'SyncWeatherController');
      next(error);
    }
  }
}