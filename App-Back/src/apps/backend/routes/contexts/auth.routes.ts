import { Router } from 'express';
import container from '../../dependency-injection';
import { RegisterController } from '../../controllers/auth/RegisterController';
import { LoginController } from '../../controllers/user/LoginController';
import { MeController } from '../../controllers/auth/MeController';
import { LogoutController } from '../../controllers/auth/LogoutController';
import { require_auth } from '../../middleware/auth.middleware';

export async function register_auth_routes(router: Router): Promise<void> {
  const registerController = await container.get('Backend.Auth.controllers.RegisterController') as RegisterController;
  const loginController = await container.get('Backend.User.controllers.LoginController') as LoginController;
  const meController = await container.get('Backend.Auth.controllers.MeController') as MeController;
  const logoutController = await container.get('Backend.Auth.controllers.LogoutController') as LogoutController;

  router.post('/api/auth/register', (req, res, next) => registerController.run(req, res, next));
  router.post('/api/auth/login', (req, res, next) => loginController.run(req, res, next));
  router.get('/api/auth/me', require_auth, (req, res, next) => meController.run(req, res, next));
  router.post('/api/auth/logout', require_auth, (req, res, next) => logoutController.run(req, res, next));
}
