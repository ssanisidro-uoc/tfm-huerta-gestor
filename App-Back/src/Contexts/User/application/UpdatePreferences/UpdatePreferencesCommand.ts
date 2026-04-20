export class UpdatePreferencesCommand {
  constructor(
    public readonly user_id: string,
    public readonly language?: string,
    public readonly theme?: string,
    public readonly notifications_enabled?: boolean
  ) {}
}