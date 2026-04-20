import { NextFunction, Request, Response, Router } from 'express';
import { CreateUserController } from '../../controllers/user/CreateUserController';
import { FindUserByIdController } from '../../controllers/user/FindUserByIdController';
import { LoginController } from '../../controllers/user/LoginController';
import { UpdateProfileController } from '../../controllers/user/UpdateProfileController';
import { GetUserPreferencesController } from '../../controllers/user/GetUserPreferencesController';
import { UpdateUserPreferencesController } from '../../controllers/user/UpdateUserPreferencesController';
import container from '../../dependency-injection';
import { async_handler, handle_validation_errors, require_auth } from '../../middleware';
import { validate_login } from '../../validators/login.validator';
import { validate_create_user, validate_find_user_by_id, validate_update_profile, validate_user_preferences } from '../../validators/user.validator';

export async function register_user_routes(router: Router): Promise<void> {
  const create_user_controller: CreateUserController = await container.get('Backend.User.controllers.CreateUserController');
  const find_user_controller: FindUserByIdController = await container.get('Backend.User.controllers.FindUserByIdController');
  const login_controller: LoginController = await container.get('Backend.User.controllers.LoginController');
  const update_profile_controller: UpdateProfileController = await container.get('Backend.User.controllers.UpdateProfileController');
  const get_preferences_controller: GetUserPreferencesController = await container.get('Backend.User.controllers.GetUserPreferencesController');
  const update_preferences_controller: UpdateUserPreferencesController = await container.get('Backend.User.controllers.UpdateUserPreferencesController');

  router.post(
    '/api/users',
    validate_create_user,
    handle_validation_errors,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      create_user_controller.run(req, res, next)
    )
  );

  router.post(
    '/api/users/login',
    validate_login(),
    handle_validation_errors,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      login_controller.execute(req, res, next)
    )
  );

  router.get(
    '/api/users/:id',
    require_auth,
    validate_find_user_by_id,
    handle_validation_errors,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      find_user_controller.run(req, res, next)
    )
  );

  router.put(
    '/api/users/profile',
    require_auth,
    validate_update_profile,
    handle_validation_errors,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      update_profile_controller.run(req, res, next)
    )
  );

  router.get(
    '/api/users/preferences',
    require_auth,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      get_preferences_controller.run(req, res, next)
    )
  );

  router.put(
    '/api/users/preferences',
    require_auth,
    async_handler((req: Request, res: Response, next: NextFunction) =>
      update_preferences_controller.run(req, res, next)
    )
  );
}
