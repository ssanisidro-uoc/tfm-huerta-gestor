import cron from 'node-cron';
import { Pool } from 'pg';
import container from '../dependency-injection';
import { logger } from '../../../Contexts/Shared/infrastructure/Logger';
import { WeatherAlertCreator } from '../../../Contexts/Weather/application/WeatherAlertsService';

export class WeatherAlertsGeneratorCronjob {
  private static scheduledTask: cron.ScheduledTask | null = null;

  static start(): void {
    if (this.scheduledTask) {
      logger.warn('WeatherAlertsGeneratorCronjob is already running', 'WeatherAlertsGeneratorCronjob');
      return;
    }

    logger.info('Starting WeatherAlertsGeneratorCronjob - Daily at 05:00', 'WeatherAlertsGeneratorCronjob');

    let alertCreator: WeatherAlertCreator | undefined;
    let weatherService: any;

    try {
      alertCreator = container.get('Backend.Weather.WeatherAlertCreator') as WeatherAlertCreator;
      weatherService = container.get('Backend.Weather.WeatherService') as any;
    } catch (e) {
      logger.warn('Weather services not registered, cronjob disabled', 'WeatherAlertsGeneratorCronjob');
      return;
    }

    this.scheduledTask = cron.schedule('0 5 * * *', async () => {
      logger.info('Running daily weather alerts generation', 'WeatherAlertsGeneratorCronjob');
      try {
        const pool = await (weatherService as any).pool;
        const gardensResult = await pool.query(`SELECT id, name FROM gardens WHERE is_active = true`);

        let totalCreated = 0;

        for (const garden of gardensResult.rows) {
          try {
            const gardenWeather = await weatherService.getGardenWeather(garden.id);
            if (gardenWeather?.forecast) {
              const count = await alertCreator!.createFromForecast(garden.id, gardenWeather.forecast);
              totalCreated += count;
            }
          } catch (error) {
            logger.error(`Failed to generate alerts for garden ${garden.id}: ${(error as Error).message}`, 'WeatherAlertsGeneratorCronjob');
          }
        }

        logger.info(`Weather alerts generation completed. Created ${totalCreated} alerts`, 'WeatherAlertsGeneratorCronjob');
      } catch (error) {
        logger.error(`Weather alerts generation failed: ${(error as Error).message}`, 'WeatherAlertsGeneratorCronjob');
      }
    });
  }

  static stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('WeatherAlertsGeneratorCronjob stopped', 'WeatherAlertsGeneratorCronjob');
    }
  }
}

export class WeatherForecastAccuracyCronjob {
  private static scheduledTask: cron.ScheduledTask | null = null;

  static start(): void {
    if (this.scheduledTask) {
      logger.warn('WeatherForecastAccuracyCronjob is already running', 'WeatherForecastAccuracyCronjob');
      return;
    }

    logger.info('Starting WeatherForecastAccuracyCronjob - Daily at 08:00', 'WeatherForecastAccuracyCronjob');

    let weatherService: any;

    try {
      weatherService = container.get('Backend.Weather.WeatherService') as any;
    } catch (e) {
      logger.warn('Weather services not registered, cronjob disabled', 'WeatherForecastAccuracyCronjob');
      return;
    }

    this.scheduledTask = cron.schedule('0 8 * * *', async () => {
      logger.info('Running daily forecast accuracy calculation', 'WeatherForecastAccuracyCronjob');
      try {
        const pool = await (weatherService as any).pool;
        
        const result = await pool.query(`
          INSERT INTO weather_forecast_accuracy (
            forecast_id, observed_id, weather_date, days_ahead,
            temp_min_error_c, temp_max_error_c, precipitation_error_mm,
            was_frost_predicted_correctly, was_rain_predicted_correctly,
            created_at
          )
          SELECT 
            f.id as forecast_id,
            o.id as observed_id,
            f.weather_date as weather_date,
            f.days_ahead,
            COALESCE(o.temp_min_c - f.temp_min_c, 0),
            COALESCE(o.temp_max_c - f.temp_max_c, 0),
            COALESCE(o.precipitation_sum::NUMERIC - f.precipitation_sum::NUMERIC, 0),
            CASE WHEN f.temp_min_c < 0 AND o.temp_min_c < 0 THEN true 
                 WHEN f.temp_min_c >= 0 AND o.temp_min_c >= 0 THEN true ELSE false END,
            CASE WHEN f.precipitation_sum > 10 AND o.precipitation_sum > 10 THEN true
                 WHEN f.precipitation_sum <= 10 AND o.precipitation_sum <= 10 THEN true ELSE false END,
            NOW()
          FROM weather_daily f
          JOIN weather_daily o ON o.weather_date = f.weather_date 
            AND o.data_type = 'current'
            AND o.weather_location_id = f.weather_location_id
          WHERE f.data_type = 'forecast'
            AND f.weather_date = CURRENT_DATE - 1
            AND NOT EXISTS (
              SELECT 1 FROM weather_forecast_accuracy wa 
              WHERE wa.forecast_id = f.id
            )
        `);

        logger.info(`Forecast accuracy calculated for ${result.rowCount} forecasts`, 'WeatherForecastAccuracyCronjob');
      } catch (error) {
        logger.error(`Forecast accuracy calculation failed: ${(error as Error).message}`, 'WeatherForecastAccuracyCronjob');
      }
    });
  }

  static stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('WeatherForecastAccuracyCronjob stopped', 'WeatherForecastAccuracyCronjob');
    }
  }
}
