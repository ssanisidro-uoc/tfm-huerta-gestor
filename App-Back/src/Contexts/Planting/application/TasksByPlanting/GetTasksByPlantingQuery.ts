export class GetTasksByPlantingQuery {
  constructor(
    public readonly plantingId: string,
    public readonly userId: string
  ) {}
}