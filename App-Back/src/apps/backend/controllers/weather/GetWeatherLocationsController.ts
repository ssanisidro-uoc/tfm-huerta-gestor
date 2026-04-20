import { NextFunction, Request, Response } from 'express';
import { WeatherService } from '../../../../Contexts/Weather/application/WeatherService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetWeatherLocationsController {
  constructor(private weatherService: WeatherService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const locations = await this.weatherService.getLocations();

      logger.debug(`Fetched ${locations.length} weather locations`, 'GetWeatherLocationsController');

      res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error: any) {
      logger.error(`Error fetching weather locations: ${error.message}`, 'GetWeatherLocationsController');
      next(error);
    }
  }
}