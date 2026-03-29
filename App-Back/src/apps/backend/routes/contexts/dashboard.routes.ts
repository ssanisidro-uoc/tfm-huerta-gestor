import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { GetDashboardStatsController } from '../../controllers/dashboard/GetDashboardStatsController';
import { GetDashboardPlotsSummaryController } from '../../controllers/dashboard/GetDashboardPlotsSummaryController';
import { GetDashboardCropsSummaryController } from '../../controllers/dashboard/GetDashboardCropsSummaryController';
import { GetDashboardRecentActivityController } from '../../controllers/dashboard/GetDashboardRecentActivityController';

export async function register_dashboard_routes(router: Router): Promise<void> {
  const statsController = await container.get('Backend.Dashboard.controllers.GetDashboardStatsController') as GetDashboardStatsController;
  const plotsSummaryController = await container.get('Backend.Dashboard.controllers.GetDashboardPlotsSummaryController') as GetDashboardPlotsSummaryController;
  const cropsSummaryController = await container.get('Backend.Dashboard.controllers.GetDashboardCropsSummaryController') as GetDashboardCropsSummaryController;
  const recentActivityController = await container.get('Backend.Dashboard.controllers.GetDashboardRecentActivityController') as GetDashboardRecentActivityController;

  router.get('/api/dashboard/stats', require_auth, (req, res, next) => {
    statsController.run(req, res, next);
  });

  router.get('/api/dashboard/plots-summary', require_auth, (req, res, next) => {
    plotsSummaryController.run(req, res, next);
  });

  router.get('/api/dashboard/crops-summary', require_auth, (req, res, next) => {
    cropsSummaryController.run(req, res, next);
  });

  router.get('/api/dashboard/recent-activity', require_auth, (req, res, next) => {
    recentActivityController.run(req, res, next);
  });
}
