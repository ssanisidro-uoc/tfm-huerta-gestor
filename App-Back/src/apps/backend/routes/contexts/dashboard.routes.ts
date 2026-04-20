import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { GetDashboardStatsController } from '../../controllers/dashboard/GetDashboardStatsController';
import { GetDashboardPlotsSummaryController } from '../../controllers/dashboard/GetDashboardPlotsSummaryController';
import { GetDashboardCropsSummaryController } from '../../controllers/dashboard/GetDashboardCropsSummaryController';
import { GetDashboardRecentActivityController } from '../../controllers/dashboard/GetDashboardRecentActivityController';
import { GetDashboardTodayTasksController } from '../../controllers/dashboard/GetDashboardTodayTasksController';
import { GetDashboardTaskStatsController } from '../../controllers/dashboard/GetDashboardTaskStatsController';
import { GetDashboardAlertsController } from '../../controllers/dashboard/GetDashboardAlertsController';

export async function register_dashboard_routes(router: Router): Promise<void> {
  const statsController = await container.get('Backend.Dashboard.controllers.GetDashboardStatsController') as GetDashboardStatsController;
  const plotsSummaryController = await container.get('Backend.Dashboard.controllers.GetDashboardPlotsSummaryController') as GetDashboardPlotsSummaryController;
  const cropsSummaryController = await container.get('Backend.Dashboard.controllers.GetDashboardCropsSummaryController') as GetDashboardCropsSummaryController;
  const recentActivityController = await container.get('Backend.Dashboard.controllers.GetDashboardRecentActivityController') as GetDashboardRecentActivityController;
  const todayTasksController = await container.get('Backend.Dashboard.controllers.GetDashboardTodayTasksController') as GetDashboardTodayTasksController;
  const taskStatsController = await container.get('Backend.Dashboard.controllers.GetDashboardTaskStatsController') as GetDashboardTaskStatsController;
  const alertsController = await container.get('Backend.Dashboard.controllers.GetDashboardAlertsController') as GetDashboardAlertsController;

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

  router.get('/api/dashboard/today-tasks', require_auth, (req, res, next) => {
    todayTasksController.run(req, res, next);
  });

  router.get('/api/dashboard/task-stats', require_auth, (req, res, next) => {
    taskStatsController.run(req, res, next);
  });

  router.get('/api/dashboard/alerts', require_auth, (req, res, next) => {
    alertsController.run(req, res, next);
  });
}