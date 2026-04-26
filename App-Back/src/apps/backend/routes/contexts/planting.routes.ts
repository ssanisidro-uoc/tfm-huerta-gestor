import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { CreatePlantingController } from '../../controllers/planting/CreatePlantingController';
import { FindPlantingsController } from '../../controllers/planting/FindPlantingsController';
import { FindPlantingByIdController } from '../../controllers/planting/FindPlantingByIdController';
import { GetPlantingStatusController } from '../../controllers/planting/GetPlantingStatusController';
import { HarvestCropController } from '../../controllers/planting/HarvestCropController';
import { FindArchivedPlantingsController } from '../../controllers/planting/FindArchivedPlantingsController';
import { FindPlantingsByPlotController } from '../../controllers/planting/FindPlantingsByPlotController';
import { PlantingAssociationsController } from '../../controllers/planting/PlantingAssociationsController';
import { PlantingTasksController } from '../../controllers/planting/PlantingTasksController';
import { async_handler } from '../../middleware';

export async function register_planting_routes(router: Router): Promise<void> {
  const createPlantingController = await container.get('Backend.Planting.controllers.CreatePlantingController') as CreatePlantingController;
  const findPlantingsController = await container.get('Backend.Planting.controllers.FindPlantingsController') as FindPlantingsController;
  const findPlantingByIdController = await container.get('Backend.Planting.controllers.FindPlantingByIdController') as FindPlantingByIdController;
  const getPlantingStatusController = await container.get('Backend.Planting.controllers.GetPlantingStatusController') as GetPlantingStatusController;
  const harvestCropController = await container.get('Backend.Planting.controllers.HarvestCropController') as HarvestCropController;
  const findArchivedPlantingsController = await container.get('Backend.Planting.controllers.FindArchivedPlantingsController') as FindArchivedPlantingsController;
  const findPlantingsByPlotController = await container.get('Backend.Planting.controllers.FindPlantingsByPlotController') as FindPlantingsByPlotController;
  const plantingAssociationsController = await container.get('Backend.Planting.controllers.PlantingAssociationsController') as PlantingAssociationsController;
  const plantingTasksController = await container.get('Backend.Planting.controllers.PlantingTasksController') as PlantingTasksController;

  router.get(
    '/api/plantings',
    require_auth,
    async_handler((req, res, next) => findPlantingsController.run(req, res, next))
  );

  router.get(
    '/api/plantings/:planting_id',
    require_auth,
    async_handler((req, res, next) => findPlantingByIdController.run(req, res, next))
  );

  router.post(
    '/api/plantings',
    require_auth,
    async_handler((req, res, next) => createPlantingController.run(req, res, next))
  );

  router.get(
    '/api/plantings/:planting_id/status',
    require_auth,
    async_handler((req, res, next) => getPlantingStatusController.run(req, res, next))
  );

  router.post(
    '/api/plantings/:planting_id/harvest',
    require_auth,
    async_handler((req, res, next) => harvestCropController.run(req, res, next))
  );

  router.get(
    '/api/gardens/:garden_id/plantings/archived',
    require_auth,
    async_handler((req, res, next) => findArchivedPlantingsController.run(req, res, next))
  );

  router.get(
    '/api/plots/:plot_id/plantings',
    require_auth,
    async_handler((req, res, next) => findPlantingsByPlotController.run(req, res, next))
  );

  router.get(
    '/api/plantings/:planting_id/associations',
    require_auth,
    async_handler((req, res, next) => plantingAssociationsController.getByPlanting(req, res, next))
  );

  router.get(
    '/api/plantings/:planting_id/tasks',
    require_auth,
    async_handler((req, res, next) => plantingTasksController.run(req, res, next))
  );
};