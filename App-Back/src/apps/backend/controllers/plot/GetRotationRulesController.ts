import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';
import { RotationRulesFinder } from '../../../../Contexts/Plot/application/RotationRules/RotationRulesFinder';

export class GetRotationRulesController {
  constructor(
    private queryBus: QueryBus,
    private rotationRulesFinder: RotationRulesFinder
  ) {}

  async getAllRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const previousCropId = req.query.previousCropId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!previousCropId) {
        res.status(400).json({ error: 'previousCropId is required' });
        return;
      }

      logger.debug(`Getting rotation rules for crop ${previousCropId}`, 'GetRotationRulesController');

      const result = await this.rotationRulesFinder.findRulesForCrop(previousCropId, page, limit);

      res.status(200).json({
        success: true,
        data: result.rules,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting rotation rules', error as Error, 'GetRotationRulesController');
      next(error);
    }
  }

  async checkRotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const { newCropId } = req.query;

      if (!plotId || !newCropId) {
        res.status(400).json({ error: 'plotId and newCropId are required' });
        return;
      }

      logger.debug(`Checking rotation for plot ${plotId} with crop ${newCropId}`, 'GetRotationRulesController');

      const result = await this.rotationRulesFinder.checkRotation(plotId, newCropId as string);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      logger.error('Error checking rotation', error as Error, 'GetRotationRulesController');
      next(error);
    }
  }

  async getAlternatives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const previousCropId = req.query.previousCropId as string;

      if (!previousCropId) {
        res.status(400).json({ error: 'previousCropId is required' });
        return;
      }

      logger.debug(`Getting alternative crops for ${previousCropId}`, 'GetRotationRulesController');

      const alternatives = await this.rotationRulesFinder.findAlternatives(previousCropId);

      res.status(200).json({
        success: true,
        data: alternatives
      });
    } catch (error: unknown) {
      logger.error('Error getting alternatives', error as Error, 'GetRotationRulesController');
      next(error);
    }
  }
}
