import { CropCompatibilityRepository } from '../../domain/CropCompatibilityRepository';

export interface CropCompatibilityResult {
  companions: any[];
  incompatibilities: any[];
}

export class CropCompatibilityFinder {
  constructor(private repository: CropCompatibilityRepository) {}

  async run(cropCatalogId: string, type?: string): Promise<CropCompatibilityResult> {
    let companions = [];
    let incompatibilities = [];

    if (type === 'companions' || type === 'all' || !type) {
      const comps = await this.repository.find_companions(cropCatalogId);
      companions = comps.map(c => c.to_response());
    }

    if (type === 'incompatible' || type === 'all' || !type) {
      const incomps = await this.repository.find_incompatibilities(cropCatalogId);
      incompatibilities = incomps.map(c => c.to_response());
    }

    return { companions, incompatibilities };
  }
}