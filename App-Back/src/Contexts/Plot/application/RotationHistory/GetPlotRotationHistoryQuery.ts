export class GetPlotRotationHistoryQuery {
  constructor(
    public readonly plotId: string,
    public readonly userId: string
  ) {}
}