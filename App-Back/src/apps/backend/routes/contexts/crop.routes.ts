import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { FindCropsController } from '../../controllers/crop/FindCropsController';
import { FindCropByIdController } from '../../controllers/crop/FindCropByIdController';
import { AdminCropController } from '../../controllers/crop/AdminCropController';

export async function register_crop_routes(router: Router): Promise<void> {
  const findCropsController = await container.get('Backend.Crop.controllers.FindCropsController') as FindCropsController;
  const findCropByIdController = await container.get('Backend.Crop.controllers.FindCropByIdController') as FindCropByIdController;
  const adminCropController = await container.get('Backend.Crop.controllers.AdminCropController') as AdminCropController;

  router.get('/api/crops', require_auth, (req, res, next) => findCropsController.run(req, res, next));
  router.get('/api/crops/:id', require_auth, (req, res, next) => findCropByIdController.run(req, res, next));

  router.post('/api/admin/crops', require_auth, (req, res, next) => adminCropController.create(req, res, next));
  router.put('/api/admin/crops/:crop_id', require_auth, (req, res, next) => adminCropController.update(req, res, next));
  router.delete('/api/admin/crops/:crop_id', require_auth, (req, res, next) => adminCropController.delete(req, res, next));
};
