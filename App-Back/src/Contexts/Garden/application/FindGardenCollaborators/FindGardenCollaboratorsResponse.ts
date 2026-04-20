export interface GardenCollaborator {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  garden_role: string;
  invited_by: string | null;
  invitation_accepted_at: Date | null;
  created_at: Date;
}

export class FindGardenCollaboratorsResponse {
  constructor(readonly collaborators: GardenCollaborator[]) {}
}