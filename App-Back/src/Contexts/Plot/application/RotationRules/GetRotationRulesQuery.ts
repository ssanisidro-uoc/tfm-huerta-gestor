export class GetRotationRulesQuery {
  constructor(
    public readonly previousCropId: string,
    public readonly nextCropId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50
  ) {}
}
