import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { CreatePlantingController } from '../../controllers/planting/CreatePlantingController';
import { GetPlantingStatusController } from '../../controllers/planting/GetPlantingStatusController';
import { HarvestCropController } from '../../controllers/planting/HarvestCropController';
import { async_handler } from '../../middleware';

export default (router: Router): void => {
  const createPlantingController = container.get('Backend.Planting.controllers.CreatePlantingController') as CreatePlantingController;
  const getPlantingStatusController = container.get('Backend.Planting.controllers.GetPlantingStatusController') as GetPlantingStatusController;
  const harvestCropController = container.get('Backend.Planting.controllers.HarvestCropController') as HarvestCropController;

  router.post(
    '/plantings',
    require_auth,
    async_handler((req, res, next) => createPlantingController.run(req, res, next))
  );

  router.get(
    '/plantings/:planting_id/status',
    require_auth,
    async_handler((req, res, next) => getPlantingStatusController.run(req, res, next))
  );

  router.post(
    '/plantings/:planting_id/harvest',
    require_auth,
    async_handler((req, res, next) => harvestCropController.run(req, res, next))
  );
};