import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { WeatherService } from '../../../../Contexts/Weather/application/WeatherService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { OpenMeteoClient, WeatherData } from '../../../../Contexts/Shared/infrastructure/OpenMeteoClient';

export class GetWeatherRecommendationsController {
  constructor(
    private queryBus: QueryBus,
    private weatherService: WeatherService
  ) {}

  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gardenId } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      
      logger.debug(`Getting weather recommendations for garden ${gardenId}, days=${days}`, 'GetWeatherRecommendationsController');

      const weather = await this.weatherService.getGardenWeather(gardenId);
      const forecast = weather.forecast.slice(0, days);

      const recommendations = this.generateRecommendations(forecast);

      res.status(200).json({
        success: true,
        data: {
          gardenId: gardenId,
          gardenName: weather.gardenName,
          location: {
            latitude: weather.location.latitude,
            longitude: weather.location.longitude,
            city: weather.location.city,
            timezone: weather.location.timezone
          },
          days: days,
          forecast: forecast.map(f => ({
            date: f.date,
            temp_max: f.tempMax,
            temp_min: f.tempMin,
            precipitation_probability: f.precipitationProbability,
            precipitation_sum: f.precipitationSum,
            weather_code: f.weatherCode,
            weather_description: f.weatherDescription,
            humidity_max: f.humidityMax,
            humidity_min: f.humidityMin,
            wind_speed_max: f.windSpeedMax,
            et0: f.et0
          })),
          recommendations: recommendations
        }
      });
    } catch (error) {
      logger.error('Error getting weather recommendations', error as Error, 'GetWeatherRecommendationsController');
      next(error);
    }
  }

  async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gardenId } = req.params;
      
      logger.debug(`Getting weather alerts for garden ${gardenId}`, 'GetWeatherRecommendationsController');

      const weather = await this.weatherService.getGardenWeather(gardenId);
      const alerts = this.generateAlerts(weather.forecast);

      res.status(200).json({
        success: true,
        data: {
          gardenId: gardenId,
          alerts: alerts
        }
      });
    } catch (error) {
      logger.error('Error getting weather alerts', error as Error, 'GetWeatherRecommendationsController');
      next(error);
    }
  }

  private generateRecommendations(forecast: WeatherData[]): any[] {
    const recommendations: any[] = [];
    let id = 1;

    for (let i = 0; i < forecast.length; i++) {
      const day = forecast[i];
      const tasks: string[] = [];

      if (day.precipitationProbability < 30 && day.tempMax > 25) {
        tasks.push('Regar - probabilidad baja de lluvia');
      }

      if (day.precipitationProbability > 70) {
        tasks.push('Evitar riego - lluvia esperada');
      }

      if (day.tempMax > 35) {
        tasks.push('Proteger plantas del calor extremo');
      }

      if (day.weatherCode >= 95) {
        tasks.push('Proteger de tormenta');
      }

      if (day.humidityMax > 80) {
        tasks.push('Vigilancia de hongos');
      }

      if (day.windSpeedMax > 40) {
        tasks.push('Proteger plantas del viento');
      }

      if (tasks.length > 0) {
        recommendations.push({
          id: `rec-${id++}`,
          action: tasks[0],
          type: 'irrigation',
          severity: day.precipitationProbability > 70 ? 'warning' : 'info',
          message: tasks.join(', '),
          description: `Temp: ${day.tempMax}°/${day.tempMin}° - ${day.weatherDescription}`,
          strength: tasks.length
        });
      }
    }

    return recommendations;
  }

  private generateAlerts(forecast: WeatherData[]): any[] {
    const alerts: any[] = [];

    for (const day of forecast) {
      if (day.tempMax > 38) {
        alerts.push({
          type: 'heat_extreme',
          severity: 'high',
          message: `Temperatura extrema: ${day.tempMax}°C el ${day.date}`,
          date: day.date
        });
      }

      if (day.weatherCode >= 95) {
        alerts.push({
          type: 'storm',
          severity: 'high',
          message: `Tormenta prevista el ${day.date}`,
          date: day.date
        });
      }

      if (day.precipitationSum > 50) {
        alerts.push({
          type: 'heavy_rain',
          severity: 'medium',
          message: `Lluvia intensa prevista: ${day.precipitationSum}mm el ${day.date}`,
          date: day.date
        });
      }
    }

    return alerts;
  }
}