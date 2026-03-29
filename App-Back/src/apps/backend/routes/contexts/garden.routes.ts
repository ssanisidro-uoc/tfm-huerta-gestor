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
import { RejectInvitationController } from '../../controllers/garden/RejectInvitationController';
import { ListSharedGardensController } from '../../controllers/garden/ListSharedGardensController';

export async function register_garden_routes(router: Router): Promise<void> {
  const createGardenController = await container.get('Backend.Garden.controllers.CreateGardenController') as CreateGardenController;
  const findGardensController = await container.get('Backend.Garden.controllers.FindGardensController') as FindGardensController;
  const findGardenByIdController = await container.get('Backend.Garden.controllers.FindGardenByIdController') as FindGardenByIdController;
  const updateGardenController = await container.get('Backend.Garden.controllers.UpdateGardenController') as UpdateGardenController;
  const deleteGardenController = await container.get('Backend.Garden.controllers.DeleteGardenController') as DeleteGardenController;
  const inviteCollaboratorController = await container.get('Backend.Garden.controllers.InviteCollaboratorController') as InviteCollaboratorController;
  const acceptInvitationController = await container.get('Backend.Garden.controllers.AcceptInvitationController') as AcceptInvitationController;
  const rejectInvitationController = await container.get('Backend.Garden.controllers.RejectInvitationController') as RejectInvitationController;
  const listSharedGardensController = await container.get('Backend.Garden.controllers.ListSharedGardensController') as ListSharedGardensController;

  router.post('/api/gardens', require_auth, (req, res, next) => createGardenController.run(req, res, next));
  
  // Importante: /shared antes de /:id para evitar conflictos de rutas
  router.get('/api/gardens/shared', require_auth, (req, res, next) => listSharedGardensController.run(req, res, next));
  
  router.get('/api/gardens', require_auth, (req, res, next) => findGardensController.run(req, res, next));
  router.get('/api/gardens/:id', require_auth, (req, res, next) => findGardenByIdController.run(req, res, next));
  router.put('/api/gardens/:id', require_auth, (req, res, next) => updateGardenController.run(req, res, next));
  router.delete('/api/gardens/:id', require_auth, (req, res, next) => deleteGardenController.run(req, res, next));

  router.post('/api/gardens/:gardenId/collaborators', require_auth, (req, res, next) => inviteCollaboratorController.run(req, res, next));
  router.post('/api/gardens/:gardenId/accept', require_auth, (req, res, next) => acceptInvitationController.run(req, res, next));
  router.post('/api/gardens/:gardenId/reject', require_auth, (req, res, next) => rejectInvitationController.run(req, res, next));
};
