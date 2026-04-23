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
      const days = parseInt(req.query.days as string) || 5;
      
      logger.debug(`Getting weather recommendations for garden ${gardenId}, days=${days}`, 'GetWeatherRecommendationsController');

      const weather = await this.weatherService.getGardenWeather(gardenId);
      const forecast = weather.forecast.slice(0, days);

      const dailyRecommendations = this.generateDailyRecommendations(forecast);

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
          forecast: forecast.map((f, index) => ({
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
            et0: f.et0,
            recommendation: dailyRecommendations[index] || null
          }))
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

  private generateDailyRecommendations(forecast: WeatherData[]): any[] {
    return forecast.map((day, index) => {
      const recommendations: any[] = [];

      if (day.precipitationProbability < 30 && day.tempMax > 25) {
        recommendations.push({
          icon: '💧',
          key: 'waterPlants',
          params: { rain: day.precipitationProbability },
          severity: 'info'
        });
      }

      if (day.precipitationProbability > 70) {
        recommendations.push({
          icon: '🌧️',
          key: 'rainExpected',
          params: { rain: day.precipitationProbability },
          severity: 'warning'
        });
      }

      if (day.tempMax > 35) {
        recommendations.push({
          icon: '🔥',
          key: 'heatWarning',
          params: { temp: day.tempMax },
          severity: 'warning'
        });
      }

      if (day.weatherCode >= 95) {
        recommendations.push({
          icon: '⛈️',
          key: 'stormWarning',
          params: { weather: day.weatherDescription },
          severity: 'critical'
        });
      }

      if (day.humidityMax > 80) {
        recommendations.push({
          icon: '🦠',
          key: 'fungusRisk',
          params: { humidity: day.humidityMax },
          severity: 'warning'
        });
      }

      if (day.windSpeedMax > 40) {
        recommendations.push({
          icon: '💨',
          key: 'windWarning',
          params: { wind: day.windSpeedMax },
          severity: 'info'
        });
      }

      if (day.tempMin < 5 && day.tempMax > 20) {
        recommendations.push({
          icon: '🌡️',
          key: 'frostWarning',
          params: { temp: day.tempMin },
          severity: 'critical'
        });
      }

      if (recommendations.length === 0) {
        return null;
      }

      return {
        id: `rec-${index + 1}`,
        type: 'irrigation',
        recommendations: recommendations,
        mainRecommendation: recommendations[0],
        severity: recommendations[0].severity
      };
    });
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