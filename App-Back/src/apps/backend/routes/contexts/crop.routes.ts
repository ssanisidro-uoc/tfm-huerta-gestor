import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { FindCropsController } from '../../controllers/crop/FindCropsController';
import { FindCropByIdController } from '../../controllers/crop/FindCropByIdController';
import { AdminCropController } from '../../controllers/crop/AdminCropController';

export default (router: Router): void => {
  const findCropsController = container.get('Backend.Crop.controllers.FindCropsController') as FindCropsController;
  const findCropByIdController = container.get('Backend.Crop.controllers.FindCropByIdController') as FindCropByIdController;
  const adminCropController = container.get('Backend.Crop.controllers.AdminCropController') as AdminCropController;

  router.get('/crops', require_auth, (req, res, next) => findCropsController.run(req, res, next));
  router.get('/crops/:id', require_auth, (req, res, next) => findCropByIdController.run(req, res, next));

  router.post('/admin/crops', require_auth, (req, res, next) => adminCropController.create(req, res, next));
  router.put('/admin/crops/:crop_id', require_auth, (req, res, next) => adminCropController.update(req, res, next));
  router.delete('/admin/crops/:crop_id', require_auth, (req, res, next) => adminCropController.delete(req, res, next));
};
