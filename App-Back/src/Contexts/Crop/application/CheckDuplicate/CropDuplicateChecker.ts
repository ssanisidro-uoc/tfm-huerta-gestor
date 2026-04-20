import { CropRepository } from '../../domain/CropRepository';

export interface DuplicateCheckResult {
  exists: boolean;
  field: string;
}

export class CropDuplicateChecker {
  constructor(private repository: CropRepository) {}

  async check(name: string, scientificName?: string, excludeId?: string): Promise<DuplicateCheckResult> {
    const result = await this.repository.findByNameOrScientific(name, scientificName, excludeId);
    if (!result) {
      return { exists: false, field: '' };
    }
    return result;
  }
}
