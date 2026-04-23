import { NextFunction, Request, Response } from 'express';
import { 
  PlantingAssociationsService,
  CreateAssociationCommand,
  CreateObservationCommand
} from '../../../../Contexts/Planting/application/PlantingAssociationsService';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class PlantingAssociationsController {
  constructor(
    private service: PlantingAssociationsService
  ) {}

  async getByPlanting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantingId } = req.params;
      const associations = await this.service.getByPlanting(plantingId);

      res.status(200).json({
        success: true,
        data: associations
      });
    } catch (error: any) {
      logger.error(`Error getting associations: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getByPlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const associations = await this.service.getByPlot(plotId);

      res.status(200).json({
        success: true,
        data: associations
      });
    } catch (error: any) {
      logger.error(`Error getting plot associations: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const association = await this.service.getById(id);

      if (!association) {
        res.status(404).json({ success: false, error: 'Association not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: association
      });
    } catch (error: any) {
      logger.error(`Error getting association: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantingId } = req.params;
      const {
        companion_planting_id,
        actual_distance_cm,
        actual_arrangement,
        actual_ratio,
        purpose,
        expected_benefit,
        user_notes
      } = req.body;

      if (!companion_planting_id) {
        res.status(400).json({ success: false, error: 'companion_planting_id is required' });
        return;
      }

      const command: CreateAssociationCommand = {
        primaryPlantingId: plantingId,
        companionPlantingId: companion_planting_id,
        actualDistanceCm: actual_distance_cm,
        actualArrangement: actual_arrangement,
        actualRatio: actual_ratio,
        purpose: purpose,
        expectedBenefit: expected_benefit,
        userNotes: user_notes
      };

      await this.service.createAssociation(command);

      res.status(201).json({
        success: true,
        message: 'Association created'
      });
    } catch (error: any) {
      logger.error(`Error creating association: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.deleteAssociation(id);

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error(`Error deleting association: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async createObservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const {
        observation_type,
        outcome,
        effectiveness_rating,
        description,
        measured_data
      } = req.body;

      if (!description) {
        res.status(400).json({ success: false, error: 'description is required' });
        return;
      }

      const command: CreateObservationCommand = {
        associationId: id,
        observedBy: userId,
        observationType: observation_type,
        outcome: outcome,
        effectivenessRating: effectiveness_rating,
        description: description,
        measuredData: measured_data
      };

      await this.service.createObservation(command);

      res.status(201).json({
        success: true,
        message: 'Observation created'
      });
    } catch (error: any) {
      logger.error(`Error creating observation: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getObservations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const observations = await this.service.getObservations(id);

      res.status(200).json({
        success: true,
        data: observations
      });
    } catch (error: any) {
      logger.error(`Error getting observations: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const report = await this.service.getReportByPlot(plotId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      logger.error(`Error getting report: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getCompanionSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const cropCatalogId = req.query.cropCatalogId as string;

      if (!cropCatalogId) {
        res.status(400).json({ success: false, error: 'cropCatalogId is required' });
        return;
      }

      const suggestions = await this.service.getCompanionSuggestions(plotId, cropCatalogId);

      res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      logger.error(`Error getting suggestions: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }

  async getActivePlantings(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, error: 'Use /api/plantings/by-plot/{plotId} instead' });
  }
}