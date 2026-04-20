import { NextFunction, Request, Response } from 'express';
import { WeatherService } from '../../../../Contexts/Weather/application/WeatherService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { AppError } from '../../../../Contexts/Shared/domain/AppError';

export class GetWeatherForecastController {
  constructor(private weatherService: WeatherService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location_id } = req.params;
      const days = parseInt(req.query.days as string) || 14;

      if (!location_id) {
        throw new AppError(400, 'MISSING_LOCATION', 'location_id is required');
      }

      const forecast = await this.weatherService.getWeatherForecast(location_id, days);

      logger.debug(`Weather forecast fetched for location ${location_id}`, 'GetWeatherForecastController');

      res.status(200).json({
        success: true,
        data: {
          forecast,
          irrigation: this.weatherService.calculateIrrigationRecommendation(forecast)
        }
      });
    } catch (error: any) {
      logger.error(`Error fetching weather forecast: ${error.message}`, 'GetWeatherForecastController');
      next(error);
    }
  }
}