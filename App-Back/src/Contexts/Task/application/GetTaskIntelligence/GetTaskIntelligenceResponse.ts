import { Response } from '../../../Shared/domain/Response';
import { UnifiedIntelligence } from '../UnifiedIntelligence/UnifiedIntelligenceService';

export class GetTaskIntelligenceResponse implements Response {
  constructor(
    readonly intelligence: UnifiedIntelligence
  ) {}
}