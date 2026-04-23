import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { PostponeTaskController } from '../../controllers/task/PostponeTaskController';
import { CompleteTaskController } from '../../controllers/task/CompleteTaskController';
import { CancelTaskController } from '../../controllers/task/CancelTaskController';
import { AssignTaskController } from '../../controllers/task/AssignTaskController';
import { FindTasksController } from '../../controllers/task/FindTasksController';
import { CreateManualTaskController } from '../../controllers/task/CreateManualTaskController';
import { DeleteManualTaskController } from '../../controllers/task/DeleteManualTaskController';
import { GetCalendarTasksController } from '../../controllers/task/GetCalendarTasksController';
import { GetUnifiedIntelligenceController } from '../../controllers/task/GetUnifiedIntelligenceController';
import { GetTaskStatsController } from '../../controllers/task/GetTaskStatsController';

export async function register_task_routes(router: Router): Promise<void> {
  const postponeTaskController = await container.get('Backend.Task.controllers.PostponeTaskController') as PostponeTaskController;
  const completeTaskController = await container.get('Backend.Task.controllers.CompleteTaskController') as CompleteTaskController;
  const cancelTaskController = await container.get('Backend.Task.controllers.CancelTaskController') as CancelTaskController;
  const assignTaskController = await container.get('Backend.Task.controllers.AssignTaskController') as AssignTaskController;
  const findTasksController = await container.get('Backend.Task.controllers.FindTasksController') as FindTasksController;
  const createManualTaskController = await container.get('Backend.Task.controllers.CreateManualTaskController') as CreateManualTaskController;
  const deleteManualTaskController = await container.get('Backend.Task.controllers.DeleteManualTaskController') as DeleteManualTaskController;
  const calendarTasksController = await container.get('Backend.Task.controllers.GetCalendarTasksController') as GetCalendarTasksController;
  const intelligenceController = await container.get('Backend.Task.controllers.GetUnifiedIntelligenceController') as GetUnifiedIntelligenceController;
  const taskStatsController = await container.get('Backend.Task.controllers.GetTaskStatsController') as GetTaskStatsController;

  router.get('/api/tasks', require_auth, (req, res, next) => {
    findTasksController.run(req, res, next);
  });

  router.get('/api/tasks/stats', require_auth, (req, res, next) => {
    taskStatsController.run(req, res, next);
  });

  router.get('/api/gardens/:garden_id/tasks', require_auth, (req, res, next) => {
    findTasksController.run(req, res, next);
  });

  router.get('/api/gardens/:garden_id/calendar', require_auth, (req, res, next) => {
    calendarTasksController.run(req, res, next);
  });

  router.post('/api/gardens/:garden_id/tasks', require_auth, (req, res, next) => {
    createManualTaskController.run(req, res, next);
  });

  router.delete('/api/tasks/:task_id', require_auth, (req, res, next) => {
    deleteManualTaskController.run(req, res, next);
  });

  router.patch('/api/tasks/:task_id/postpone', require_auth, (req, res, next) => {
    postponeTaskController.run(req, res, next);
  });

  router.patch('/api/tasks/:task_id/complete', require_auth, (req, res, next) => {
    completeTaskController.run(req, res, next);
  });

  router.patch('/api/tasks/:task_id/cancel', require_auth, (req, res, next) => {
    cancelTaskController.run(req, res, next);
  });

  router.patch('/api/tasks/:task_id/assign', require_auth, (req, res, next) => {
    assignTaskController.run(req, res, next);
  });

  router.get('/api/tasks/:taskId/intelligence', require_auth, (req, res, next) => {
    intelligenceController.getByTaskId(req, res, next);
  });

  router.get('/api/gardens/:gardenId/tasks/intelligence', require_auth, (req, res, next) => {
    intelligenceController.getByGarden(req, res, next);
  });
};
