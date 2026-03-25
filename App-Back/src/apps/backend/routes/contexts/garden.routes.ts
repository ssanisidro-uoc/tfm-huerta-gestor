import { Router } from 'express';
import container from '../../dependency-injection';
import { require_auth } from '../../middleware/auth.middleware';
import { CreateGardenController } from '../../controllers/garden/CreateGardenController';
import { FindGardensController } from '../../controllers/garden/FindGardensController';
import { FindGardenByIdController } from '../../controllers/garden/FindGardenByIdController';
import { UpdateGardenController } from '../../controllers/garden/UpdateGardenController';
import { DeleteGardenController } from '../../controllers/garden/DeleteGardenController';
import { InviteCollaboratorController } from '../../controllers/garden/InviteCollaboratorController';
import { AcceptInvitationController } from '../../controllers/garden/AcceptInvitationController';
import { ListSharedGardensController } from '../../controllers/garden/ListSharedGardensController';

export default (router: Router): void => {
  const createGardenController = container.get('Backend.Garden.controllers.CreateGardenController') as CreateGardenController;
  const findGardensController = container.get('Backend.Garden.controllers.FindGardensController') as FindGardensController;
  const findGardenByIdController = container.get('Backend.Garden.controllers.FindGardenByIdController') as FindGardenByIdController;
  const updateGardenController = container.get('Backend.Garden.controllers.UpdateGardenController') as UpdateGardenController;
  const deleteGardenController = container.get('Backend.Garden.controllers.DeleteGardenController') as DeleteGardenController;
  const inviteCollaboratorController = container.get('Backend.Garden.controllers.InviteCollaboratorController') as InviteCollaboratorController;
  const acceptInvitationController = container.get('Backend.Garden.controllers.AcceptInvitationController') as AcceptInvitationController;
  const listSharedGardensController = container.get('Backend.Garden.controllers.ListSharedGardensController') as ListSharedGardensController;

  router.post('/gardens', require_auth, (req, res, next) => createGardenController.run(req, res, next));
  router.get('/gardens', require_auth, (req, res, next) => findGardensController.run(req, res, next));
  router.get('/gardens/shared', require_auth, (req, res, next) => listSharedGardensController.run(req, res, next));
  router.get('/gardens/:id', require_auth, (req, res, next) => findGardenByIdController.run(req, res, next));
  router.put('/gardens/:id', require_auth, (req, res, next) => updateGardenController.run(req, res, next));
  router.delete('/gardens/:id', require_auth, (req, res, next) => deleteGardenController.run(req, res, next));

  router.post('/gardens/:gardenId/collaborators', require_auth, (req, res, next) => inviteCollaboratorController.run(req, res, next));
  router.post('/gardens/:gardenId/accept', require_auth, (req, res, next) => acceptInvitationController.run(req, res, next));
};
