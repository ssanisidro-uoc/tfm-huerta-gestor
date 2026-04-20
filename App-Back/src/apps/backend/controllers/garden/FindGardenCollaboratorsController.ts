import { NextFunction, Request, Response } from 'express';
import { FindGardenCollaboratorsQuery } from '../../../../Contexts/Garden/application/FindGardenCollaborators/FindGardenCollaboratorsQuery';
import { FindGardenCollaboratorsResponse } from '../../../../Contexts/Garden/application/FindGardenCollaborators/FindGardenCollaboratorsResponse';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class FindGardenCollaboratorsController {
  constructor(private queryBus: QueryBus) {}

  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      logger.debug(`Finding collaborators for garden ${id}`, 'FindGardenCollaboratorsController');

      const query = new FindGardenCollaboratorsQuery(id);
      const response = await this.queryBus.ask(query) as FindGardenCollaboratorsResponse;

      res.status(200).json({ collaborators: response.collaborators });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error finding collaborators', err, 'FindGardenCollaboratorsController');
      next(error);
    }
  }
}