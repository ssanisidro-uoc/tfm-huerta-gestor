import { NextFunction, Request, Response } from 'express';
import { QueryBus } from '../../../../Contexts/Shared/domain/QueryBus';
import { CommandBus } from '../../../../Contexts/Shared/domain/CommandBus';
import { 
  GetAssociationsByPlantingQuery, 
  GetAssociationsByPlotQuery, 
  GetAssociationByIdQuery,
  GetCompanionSuggestionsQuery,
  GetActivePlantingsQuery 
} from '../../../../Contexts/Planting/application/PlantingAssociations/AssociationQueries';
import { 
  CreateAssociationCommand, 
  DeleteAssociationCommand,
  CreateObservationCommand 
} from '../../../../Contexts/Planting/application/PlantingAssociations/AssociationCommands';
import { logger } from '../../../../Contexts/Shared/infrastructure/Logger';

export class PlantingAssociationsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus
  ) {}

  async getByPlanting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plantingId } = req.params;
      const query = new GetAssociationsByPlantingQuery(plantingId);
      const associations = await this.queryBus.ask(query);

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
      const query = new GetAssociationsByPlotQuery(plotId);
      const associations = await this.queryBus.ask(query);

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
      const query = new GetAssociationByIdQuery(id);
      const association = await this.queryBus.ask(query);

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

      const command = new CreateAssociationCommand(
        plantingId,
        companion_planting_id,
        actual_distance_cm,
        actual_arrangement,
        actual_ratio,
        purpose,
        expected_benefit,
        user_notes
      );

      await this.commandBus.dispatch(command);

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
      const command = new DeleteAssociationCommand(id);
      await this.commandBus.dispatch(command);

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

      const command = new CreateObservationCommand(
        id,
        userId,
        observation_type,
        outcome,
        effectiveness_rating,
        description,
        measured_data
      );

      await this.commandBus.dispatch(command);

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
    res.status(501).json({ success: false, error: 'Not implemented' });
  }

  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ success: false, error: 'Not implemented' });
  }

  async getCompanionSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { plotId } = req.params;
      const cropCatalogId = req.query.cropCatalogId as string;

      if (!cropCatalogId) {
        res.status(400).json({ success: false, error: 'cropCatalogId is required' });
        return;
      }

      const query = new GetCompanionSuggestionsQuery(plotId, cropCatalogId);
      const suggestions = await this.queryBus.ask(query);

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
    try {
      const { plotId } = req.params;
      const query = new GetActivePlantingsQuery(plotId);
      const plantings = await this.queryBus.ask(query);

      res.status(200).json({
        success: true,
        data: plantings
      });
    } catch (error: any) {
      logger.error(`Error getting active plantings: ${error.message}`, 'PlantingAssociationsController');
      next(error);
    }
  }
}