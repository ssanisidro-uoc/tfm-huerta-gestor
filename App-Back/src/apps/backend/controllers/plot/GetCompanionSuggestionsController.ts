import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class GetCompanionSuggestionsController {
  async run(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: plotId } = req.params;
      const { cropCatalogId } = req.query;

      logger.debug(`Companion suggestions for plot ${plotId}, crop ${cropCatalogId}`, 'GetCompanionSuggestionsController');

      res.status(200).json({
        success: true,
        companions: [],
        antagonists: [],
        message: 'Companion analysis not yet configured'
      });
    } catch (error) {
      logger.error('Error in companion suggestions', error as Error, 'GetCompanionSuggestionsController');
      next(error);
    }
  }
}