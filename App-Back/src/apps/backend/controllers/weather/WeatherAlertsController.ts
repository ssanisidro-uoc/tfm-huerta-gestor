import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class WeatherAlertsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus
  ) {}

  async getByGarden(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, error: 'Not implemented' });
  }

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, error: 'Not implemented' });
  }

  async acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, error: 'Not implemented' });
  }
}