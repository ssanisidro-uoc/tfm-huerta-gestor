import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { CreatePlotController } from '../../controllers/plot/CreatePlotController';
import { FindPlotsController } from '../../controllers/plot/FindPlotsController';
import { FindPlotByIdController } from '../../controllers/plot/FindPlotByIdController';
import { UpdatePlotController } from '../../controllers/plot/UpdatePlotController';
import { DeletePlotController } from '../../controllers/plot/DeletePlotController';

export async function register_plot_routes(router: Router): Promise<void> {
  const createPlotController = await container.get('Backend.Plot.controllers.CreatePlotController') as CreatePlotController;
  const findPlotsController = await container.get('Backend.Plot.controllers.FindPlotsController') as FindPlotsController;
  const findPlotByIdController = await container.get('Backend.Plot.controllers.FindPlotByIdController') as FindPlotByIdController;
  const updatePlotController = await container.get('Backend.Plot.controllers.UpdatePlotController') as UpdatePlotController;
  const deletePlotController = await container.get('Backend.Plot.controllers.DeletePlotController') as DeletePlotController;

  router.post('/api/gardens/:gardenId/plots', require_auth, (req, res, next) => createPlotController.run(req, res, next));
  router.get('/api/gardens/:gardenId/plots', require_auth, (req, res, next) => findPlotsController.run(req, res, next));
  router.get('/api/plots/:id', require_auth, (req, res, next) => findPlotByIdController.run(req, res, next));
  router.put('/api/plots/:id', require_auth, (req, res, next) => updatePlotController.run(req, res, next));
  router.delete('/api/plots/:id', require_auth, (req, res, next) => deletePlotController.run(req, res, next));
};
