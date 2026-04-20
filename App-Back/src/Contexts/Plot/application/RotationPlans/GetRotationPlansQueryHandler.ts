import { RotationPlansFinder } from './RotationPlansService';

export class GetRotationPlansQuery {
  constructor(public readonly plotId: string) {}
}

export class GetRotationPlansQueryHandler {
  constructor(private finder: RotationPlansFinder) {}

  async handle(query: GetRotationPlansQuery) {
    return this.finder.findByPlotId(query.plotId);
  }
}

export class GetRotationPlanByIdQuery {
  constructor(public readonly planId: string) {}
}

export class GetRotationPlanByIdQueryHandler {
  constructor(private finder: RotationPlansFinder) {}

  async handle(query: GetRotationPlanByIdQuery) {
    const plan = await this.finder.findById(query.planId);
    if (!plan) {
      throw new Error('Rotation plan not found');
    }
    return plan;
  }
}
