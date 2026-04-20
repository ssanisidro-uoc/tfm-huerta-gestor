import cron from 'node-cron';
import { Pool } from 'pg';
import container from '../dependency-injection';
import { logger } from '../../../Contexts/Shared/infrastructure/Logger';
import { Task } from '../../../Contexts/Task/domain/Task';
import { TaskId } from '../../../Contexts/Task/domain/value-objects/TaskId';
import { TaskTitle } from '../../../Contexts/Task/domain/value-objects/TaskTitle';
import { GardenId } from '../../../Contexts/Garden/domain/value-objects/GardenId';
import { WeatherService } from '../../../Contexts/Weather/application/WeatherService';
import { WeatherIntelligenceService } from '../../../Contexts/Weather/application/WeatherIntelligenceService';

interface WeatherTaskTemplate {
  alertType: string;
  taskType: string;
  taskCategory: string;
  titleTemplate: string;
  descriptionTemplate: string;
  priority: string;
  estimatedDuration: number;
}

export class WeatherTaskGeneratorCronjob {
  private static scheduledTask: cron.ScheduledTask | null = null;

  private static readonly TASK_TEMPLATES: WeatherTaskTemplate[] = [
    {
      alertType: 'frost',
      taskType: 'protection',
      taskCategory: 'maintenance',
      titleTemplate: '🥶 Protección contra heladas',
      descriptionTemplate: 'Temperaturas bajo cero previstas. Cubrir cultivos sensibles, retrasar riego, cosechar cultivos sensibles a heladas.',
      priority: 'high',
      estimatedDuration: 60
    },
    {
      alertType: 'heat_wave',
      taskType: 'protection',
      taskCategory: 'watering',
      titleTemplate: '🔥 Protección contra ola de calor',
      descriptionTemplate: 'Temperaturas extremas previstas. Aumentar riego, proporcionar sombra a cultivos sensibles, cosechar antes si es necesario.',
      priority: 'high',
      estimatedDuration: 45
    },
    {
      alertType: 'heavy_rain',
      taskType: 'preparation',
      taskCategory: 'maintenance',
      titleTemplate: '🌧️ Preparación para lluvia intensa',
      descriptionTemplate: 'Lluvia fuerte prevista. Revisar drenaje, asegurar estructuras, retrasar riego.',
      priority: 'medium',
      estimatedDuration: 30
    },
    {
      alertType: 'drought',
      taskType: 'irrigation',
      taskCategory: 'watering',
      titleTemplate: '💧 Riego adicional por sequía',
      descriptionTemplate: 'Período sin lluvias previsto. Aumentar frecuencia de riego, aplicar mulch.',
      priority: 'medium',
      estimatedDuration: 30
    },
    {
      alertType: 'high_humidity',
      taskType: 'prevention',
      taskCategory: 'pest_disease',
      titleTemplate: '💨 Control por alta humedad',
      descriptionTemplate: 'Humedad alta prevista. Vigilar enfermedades fúngicas, mejorar ventilación.',
      priority: 'medium',
      estimatedDuration: 30
    }
  ];

  static start(): void {
    if (this.scheduledTask) {
      logger.warn('WeatherTaskGeneratorCronjob is already running', 'WeatherTaskGeneratorCronjob');
      return;
    }

    logger.info('Starting WeatherTaskGeneratorCronjob - Daily at 06:00', 'WeatherTaskGeneratorCronjob');

    let weatherService: WeatherService | undefined;
    let weatherIntelligence: WeatherIntelligenceService | undefined;
    let taskRepository: any;

    try {
      weatherService = container.get('Backend.Weather.application.WeatherService') as WeatherService;
      weatherIntelligence = container.get('Backend.Weather.application.WeatherIntelligenceService') as WeatherIntelligenceService;
      taskRepository = container.get('Backend.Task.domain.TaskRepository') as any;
    } catch (e) {
      logger.warn('Weather services not registered, cronjob disabled', 'WeatherTaskGeneratorCronjob');
      return;
    }

    this.scheduledTask = cron.schedule('0 6 * * *', async () => {
      logger.info('Running daily weather task generation', 'WeatherTaskGeneratorCronjob');
      try {
        const createdCount = await this.generateWeatherTasks(weatherService!, weatherIntelligence!, taskRepository);
        logger.info(`Weather task generation completed. Created ${createdCount} tasks`, 'WeatherTaskGeneratorCronjob');
      } catch (error) {
        logger.error(`Weather task generation failed: ${(error as Error).message}`, 'WeatherTaskGeneratorCronjob');
      }
    });
  }

  static stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('WeatherTaskGeneratorCronjob stopped', 'WeatherTaskGeneratorCronjob');
    }
  }

  static getStatus(): { running: boolean } {
    return { running: this.scheduledTask !== null };
  }

  private static async generateWeatherTasks(
    weatherService: WeatherService,
    weatherIntelligence: WeatherIntelligenceService,
    taskRepository: any
  ): Promise<number> {
    const pool = await (weatherService as any).pool;
    let createdCount = 0;

    const gardensResult = await pool.query(`
      SELECT g.id, g.name 
      FROM gardens g 
      WHERE g.is_active = true
    `);

    logger.info(`Processing ${gardensResult.rows.length} gardens`, 'WeatherTaskGeneratorCronjob');

    for (const garden of gardensResult.rows) {
      try {
        const count = await this.processGarden(garden, weatherService, weatherIntelligence, taskRepository, pool);
        createdCount += count;
      } catch (error) {
        logger.error(`Failed to process garden ${garden.id}: ${(error as Error).message}`, 'WeatherTaskGeneratorCronjob');
      }
    }

    return createdCount;
  }

  private static async processGarden(
    garden: { id: string; name: string },
    weatherService: WeatherService,
    weatherIntelligence: WeatherIntelligenceService,
    taskRepository: any,
    pool: Pool
  ): Promise<number> {
    let createdCount = 0;

    const gardenWeather = await weatherService.getGardenWeather(garden.id);
    const forecast = gardenWeather.forecast;

    if (!forecast || forecast.length === 0) {
      logger.debug(`No forecast available for garden ${garden.id}`, 'WeatherTaskGeneratorCronjob');
      return 0;
    }

    const alerts = await weatherIntelligence.generateWeatherAlerts(garden.id, forecast);

    for (const alert of alerts) {
      if (alert.severity !== 'high' && alert.severity !== 'medium') {
        continue;
      }

      const existingTask = await this.findExistingWeatherTask(pool, garden.id, alert.alertType, alert.startDate);
      if (existingTask) {
        logger.debug(`Weather task already exists for ${alert.alertType} on ${alert.startDate}`, 'WeatherTaskGeneratorCronjob');
        continue;
      }

      const template = this.TASK_TEMPLATES.find(t => t.alertType === alert.alertType);
      if (!template) {
        logger.debug(`No template found for alert type ${alert.alertType}`, 'WeatherTaskGeneratorCronjob');
        continue;
      }

      const task = new Task({
        id: new TaskId(crypto.randomUUID()),
        garden_id: new GardenId(garden.id),
        task_type: template.taskType,
        task_category: template.taskCategory,
        title: new TaskTitle(template.titleTemplate),
        description: template.descriptionTemplate,
        instructions: alert.recommendedActions.map(a => `- ${a}`).join('\n'),
        scheduled_date: alert.startDate,
        due_date: alert.endDate,
        estimated_duration_minutes: template.estimatedDuration,
        priority: template.priority,
        generated_by: 'system',
        climate_triggered: true,
        related_weather_event: alert.alertType,
        status: 'pending',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      await taskRepository.save(task);
      createdCount++;

      logger.info(`Created weather task: ${task.title} for garden ${garden.name}`, 'WeatherTaskGeneratorCronjob');
    }

    return createdCount;
  }

  private static async findExistingWeatherTask(
    pool: Pool,
    gardenId: string,
    alertType: string,
    date: Date
  ): Promise<boolean> {
    const dateStr = date.toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT id FROM tasks 
      WHERE garden_id = $1 
        AND related_weather_event = $2
        AND scheduled_date = $3
        AND status != 'cancelled'
      LIMIT 1
    `, [gardenId, alertType, dateStr]);

    return result.rows.length > 0;
  }
}
