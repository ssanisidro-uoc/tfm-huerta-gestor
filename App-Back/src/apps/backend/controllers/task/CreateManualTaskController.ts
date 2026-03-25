import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { CreateManualTaskCommand } from '../../../../Contexts/Task/application/CreateManualTask/CreateManualTaskCommand';
import { UserGardenRepository } from '../../../../Contexts/Garden/infrastructure/persistence/UserGardenRepository';
import crypto from 'crypto';

interface CreateManualTaskBody {
  plot_id?: string;
  planting_id?: string;
  task_type: string;
  task_category?: string;
  title: string;
  description?: string;
  scheduled_date: string;
  due_date?: string;
  estimated_duration_minutes?: number;
  priority?: string;
}

export class CreateManualTaskController {
  constructor(
    private commandBus: CommandBus,
    private userGardenRepository: UserGardenRepository
  ) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { garden_id } = req.params;
      const body = req.body as CreateManualTaskBody;

      if (!garden_id) {
        res.status(400).json({ error: 'garden_id is required' });
        return;
      }

      if (!body.task_type) {
        res.status(400).json({ error: 'task_type is required' });
        return;
      }

      if (!body.title) {
        res.status(400).json({ error: 'title is required' });
        return;
      }

      if (!body.scheduled_date) {
        res.status(400).json({ error: 'scheduled_date is required' });
        return;
      }

      const hasAccess = await this.userGardenRepository.has_permission(userId, garden_id, 'collaborator');
      if (!hasAccess) {
        const garden = await this.userGardenRepository.find_by_user_and_garden(userId, garden_id);
        if (!garden) {
          res.status(403).json({ error: 'You do not have access to this garden' });
          return;
        }
      }

      logger.debug(`Creating manual task for garden ${garden_id} by user ${userId}`, 'CreateManualTaskController');

      const command = new CreateManualTaskCommand(
        crypto.randomUUID(),
        garden_id,
        body.plot_id || null,
        body.planting_id || null,
        body.task_type,
        body.task_category || null,
        body.title,
        body.description || null,
        new Date(body.scheduled_date),
        body.due_date ? new Date(body.due_date) : null,
        body.estimated_duration_minutes || null,
        body.priority || 'medium',
        userId
      );

      await this.commandBus.dispatch(command);

      logger.info(`Manual task created successfully in garden ${garden_id}`, 'CreateManualTaskController');

      res.status(201).json({
        success: true,
        message: 'Task created successfully'
      });
    } catch (error: unknown) {
      logger.error('Error creating manual task', error as Error, 'CreateManualTaskController');
      next(error);
    }
  }
}
