import { NextFunction, Request, Response, Router } from 'express';
import { GetTodayLunarController } from '../../controllers/lunar/GetTodayLunarController';
import { GetLunarRecommendationsController } from '../../controllers/lunar/GetLunarRecommendationsController';
import { LunarTaskRecommendationController } from '../../controllers/lunar/LunarTaskRecommendationController';
import { LunarCalendarController } from '../../controllers/lunar/LunarCalendarController';
import container from '../../dependency-injection';
import { async_handler } from '../../middleware';

export async function register_lunar_routes(router: Router): Promise<void> {
  const get_today_lunar_controller: GetTodayLunarController = await container.get('Backend.Lunar.controllers.GetTodayLunarController');
  const get_lunar_recommendations_controller: GetLunarRecommendationsController = await container.get('Backend.Lunar.controllers.GetLunarRecommendationsController');
  const lunar_task_recommendation_controller: LunarTaskRecommendationController = await container.get('Backend.Lunar.controllers.LunarTaskRecommendationController');
  const lunar_calendar_controller: LunarCalendarController = await container.get('Backend.Lunar.controllers.LunarCalendarController');

  // Today's lunar data
  router.get(
    '/api/lunar/today',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      get_today_lunar_controller.run(req, res, next)
    )
  );

  // Monthly calendar
  router.get(
    '/api/lunar/calendar/:year/:month',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      lunar_calendar_controller.getMonthly(req, res, next)
    )
  );

  // General recommendations for task type
  router.get(
    '/api/lunar/recommendations/:taskType',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      get_lunar_recommendations_controller.run(req, res, next)
    )
  );

  // Task-specific recommendation tracking
  router.get(
    '/api/lunar/task/:taskId/recommendations',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      lunar_task_recommendation_controller.getByTaskId(req, res, next)
    )
  );

  router.put(
    '/api/lunar/task/recommendations/:recommendationId/shown',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      lunar_task_recommendation_controller.markAsShown(req, res, next)
    )
  );

  router.put(
    '/api/lunar/task/recommendations/:recommendationId/response',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      lunar_task_recommendation_controller.updateUserResponse(req, res, next)
    )
  );

  router.get(
    '/api/lunar/task/:taskId/recommendations/stats',
    async_handler((req: Request, res: Response, next: NextFunction) =>
      lunar_task_recommendation_controller.getStatistics(req, res, next)
    )
  );
}