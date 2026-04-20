import { NextFunction, Request, Response } from 'express';
import { RotationPlansFinder, RotationPlanCreator, RotationPlanUpdater } from '../../../../Contexts/Plot/application/RotationPlans/RotationPlansService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class RotationPlansController {
  constructor(
    private finder: RotationPlansFinder,
    private creator: RotationPlanCreator,
    private updater: RotationPlanUpdater
  ) {}

  async getByPlotId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const plans = await this.finder.findByPlotId(plotId);

      res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error: any) {
      logger.error(`Error getting rotation plans: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const plan = await this.finder.findById(planId);

      if (!plan) {
        res.status(404).json({ success: false, error: 'Rotation plan not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error: any) {
      logger.error(`Error getting rotation plan: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const userId = (req as any).user?.id;
      const {
        crop_catalog_id,
        planned_planting_date,
        planned_harvest_date,
        rotation_cycle_year,
        sequence_order,
        primary_goal,
        user_notes,
        variety
      } = req.body;

      if (!crop_catalog_id || !planned_planting_date) {
        res.status(400).json({ success: false, error: 'crop_catalog_id and planned_planting_date are required' });
        return;
      }

      const result = await this.creator.create({
        plotId,
        cropCatalogId: crop_catalog_id,
        plannedPlantingDate: planned_planting_date,
        userId,
        plannedHarvestDate: planned_harvest_date,
        rotationCycleYear: rotation_cycle_year,
        sequenceOrder: sequence_order,
        primaryGoal: primary_goal,
        userNotes: user_notes,
        variety
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error(`Error creating rotation plan: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const {
        planned_planting_date,
        planned_harvest_date,
        rotation_cycle_year,
        sequence_order,
        primary_goal,
        user_notes,
        plan_status
      } = req.body;

      const result = await this.updater.update({
        id: planId,
        plannedPlantingDate: planned_planting_date,
        plannedHarvestDate: planned_harvest_date,
        rotationCycleYear: rotation_cycle_year,
        sequenceOrder: sequence_order,
        primaryGoal: primary_goal,
        userNotes: user_notes,
        planStatus: plan_status
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'No fields to update') {
        res.status(400).json({ success: false, error: 'No fields to update' });
        return;
      }
      logger.error(`Error updating rotation plan: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;

      await this.updater.delete(planId);

      res.status(200).json({ success: true });
    } catch (error: any) {
      if (error.message === 'Rotation plan not found') {
        res.status(404).json({ success: false, error: 'Rotation plan not found' });
        return;
      }
      logger.error(`Error deleting rotation plan: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;

      const result = await this.updater.update({
        id: planId,
        planStatus: 'approved'
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Rotation plan not found') {
        res.status(404).json({ success: false, error: 'Rotation plan not found' });
        return;
      }
      logger.error(`Error approving rotation plan: ${error.message}`, 'RotationPlansController');
      next(error);
    }
  }
}
