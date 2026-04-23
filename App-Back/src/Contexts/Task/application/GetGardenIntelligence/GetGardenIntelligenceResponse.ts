import { Response } from '../../../Shared/domain/Response';
import { UnifiedIntelligence } from '../UnifiedIntelligence/UnifiedIntelligenceService';

export class GetGardenIntelligenceResponse implements Response {
  constructor(
    readonly intelligences: UnifiedIntelligence[]
  ) {}
}