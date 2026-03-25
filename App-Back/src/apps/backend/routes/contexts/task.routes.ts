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

export default (router: Router): void => {
  const postponeTaskController = container.get('Backend.Task.controllers.PostponeTaskController') as PostponeTaskController;
  const completeTaskController = container.get('Backend.Task.controllers.CompleteTaskController') as CompleteTaskController;
  const cancelTaskController = container.get('Backend.Task.controllers.CancelTaskController') as CancelTaskController;
  const assignTaskController = container.get('Backend.Task.controllers.AssignTaskController') as AssignTaskController;
  const findTasksController = container.get('Backend.Task.controllers.FindTasksController') as FindTasksController;
  const createManualTaskController = container.get('Backend.Task.controllers.CreateManualTaskController') as CreateManualTaskController;
  const deleteManualTaskController = container.get('Backend.Task.controllers.DeleteManualTaskController') as DeleteManualTaskController;
  const calendarTasksController = container.get('Backend.Task.controllers.GetCalendarTasksController') as GetCalendarTasksController;

  router.get('/gardens/:garden_id/tasks', require_auth, (req, res, next) => {
    findTasksController.run(req, res, next);
  });

  router.get('/gardens/:garden_id/calendar', require_auth, (req, res, next) => {
    calendarTasksController.run(req, res, next);
  });

  router.post('/gardens/:garden_id/tasks', require_auth, (req, res, next) => {
    createManualTaskController.run(req, res, next);
  });

  router.delete('/tasks/:task_id', require_auth, (req, res, next) => {
    deleteManualTaskController.run(req, res, next);
  });

  router.patch('/tasks/:task_id/postpone', require_auth, (req, res, next) => {
    postponeTaskController.run(req, res, next);
  });

  router.patch('/tasks/:task_id/complete', require_auth, (req, res, next) => {
    completeTaskController.run(req, res, next);
  });

  router.patch('/tasks/:task_id/cancel', require_auth, (req, res, next) => {
    cancelTaskController.run(req, res, next);
  });

  router.patch('/tasks/:task_id/assign', require_auth, (req, res, next) => {
    assignTaskController.run(req, res, next);
  });
};
