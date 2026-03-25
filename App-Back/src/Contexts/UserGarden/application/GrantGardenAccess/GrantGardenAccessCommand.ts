import { Command } from '../../../Shared/domain/Command';

export class GrantGardenAccessCommand extends Command {
  constructor(
    readonly id: string,
    readonly user_id: string,
    readonly garden_id: string,
    readonly garden_role: string,
    readonly invited_by: string | null
  ) {
    super();
  }
}
