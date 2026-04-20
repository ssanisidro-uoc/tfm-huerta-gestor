import { NextFunction, Request, Response } from 'express';
import { WeatherService } from '../../../../Contexts/Weather/application/WeatherService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetGardenWeatherController {
  constructor(private weatherService: WeatherService) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { garden_id } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!garden_id) {
        res.status(400).json({ error: 'garden_id is required' });
        return;
      }

      const weather = await this.weatherService.getGardenWeather(garden_id);

      logger.debug(`Weather fetched for garden ${garden_id}`, 'GetGardenWeatherController');

      res.status(200).json({
        success: true,
        data: weather
      });
    } catch (error: any) {
      logger.error(`Error fetching garden weather: ${error.message}`, 'GetGardenWeatherController');
      next(error);
    }
  }
}