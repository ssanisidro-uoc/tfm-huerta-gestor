import cron from 'node-cron';
import container from '../dependency-injection';
import { logger } from '../../../Contexts/Shared/infrastructure/Logger';

export class TaskRecurrenceCronjob {
  private static scheduledTask: cron.ScheduledTask | null = null;

  static start(): void {
    if (this.scheduledTask) {
      logger.warn('TaskRecurrenceCronjob is already running', 'TaskRecurrenceCronjob');
      return;
    }

    logger.info('Starting TaskRecurrenceCronjob - Daily at 00:00', 'TaskRecurrenceCronjob');

    let synchronizer: any;
    try {
      synchronizer = container.get('Backend.Task.application.RecurringTaskSynchronizer');
    } catch (e) {
      logger.warn('TaskRecurrenceSynchronizer not registered, cronjob disabled', 'TaskRecurrenceCronjob');
      return;
    }

    this.scheduledTask = cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily recurring tasks synchronization', 'TaskRecurrenceCronjob');
      try {
        const createdCount = await synchronizer.synchronize();
        logger.info(`Daily sync completed. Created ${createdCount} new occurrences`, 'TaskRecurrenceCronjob');
      } catch (error) {
        logger.error(`Daily sync failed: ${(error as Error).message}`, 'TaskRecurrenceCronjob');
      }
    });
  }

  static stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      logger.info('TaskRecurrenceCronjob stopped', 'TaskRecurrenceCronjob');
    }
  }

  static getStatus(): { running: boolean } {
    return { running: this.scheduledTask !== null };
  }
}
