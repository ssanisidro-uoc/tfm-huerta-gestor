import { RotationRulesRepository } from '../../infrastructure/persistence/PostgresRotationRulesRepository';
import { CropRotationRule, RotationRecommendation } from '../../domain/RotationRulesRepository';
import { PlantingRepository } from '../../../Planting/domain/PlantingRepository';
import { GetRotationRulesResponse } from './GetRotationRulesResponse';

export class RotationRulesFinder {
  constructor(
    private rotationRulesRepository: RotationRulesRepository,
    private plantingRepository: PlantingRepository
  ) {}

  async findRulesForCrop(
    previousCropId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<GetRotationRulesResponse> {
    const result = await this.rotationRulesRepository.findAllRules(page, limit);
    return {
      rules: result.rules,
      total: result.total,
      page,
      limit
    };
  }

  async checkRotation(
    plotId: string,
    newCropId: string
  ): Promise<RotationRecommendation> {
    const recentPlantings = await this.plantingRepository.findRecentByPlot(plotId, 5);
    
    if (recentPlantings.length === 0) {
      return {
        isSafe: true,
        severity: 'info',
        message: 'No previous plantings found. Any crop can be planted.'
      };
    }

    const lastPlanting = recentPlantings[0];
    const previousCropId = lastPlanting.crop_catalog_id;

    const rule = await this.rotationRulesRepository.findRule(previousCropId, newCropId);

    if (!rule) {
      return {
        isSafe: true,
        severity: 'info',
        message: `No specific rotation rule found for ${lastPlanting.crop_name} → new crop.`
      };
    }

    const isSafe = rule.rotationType !== 'discouraged' && rule.rotationType !== 'prohibited';
    const severity = rule.rotationType === 'prohibited' || rule.rotationType === 'discouraged' 
      ? 'error' 
      : rule.rotationType === 'cautionary' 
        ? 'warning' 
        : 'info';

    let message = '';
    switch (rule.rotationType) {
      case 'highly_recommended':
        message = `Excellent choice! Planting after ${rule.previousCropName} is highly recommended.`;
        break;
      case 'recommended':
        message = `Good choice. Planting after ${rule.previousCropName} is recommended.`;
        break;
      case 'neutral':
        message = `This crop can be planted after ${rule.previousCropName} with no specific issues.`;
        break;
      case 'cautionary':
        message = `Caution: Planting after ${rule.previousCropName} may cause ${rule.primaryReason}.`;
        break;
      case 'discouraged':
        message = `Not recommended: ${rule.primaryReason}.`;
        break;
      case 'prohibited':
        message = `Avoid: ${rule.primaryReason}. This rotation can cause serious issues.`;
        break;
    }

    const alternatives = await this.rotationRulesRepository.findAlternativeCrops(previousCropId, 5);

    return {
      isSafe,
      severity,
      message,
      rule,
      alternatives: alternatives.map(alt => ({
        cropId: alt.crop_id,
        cropName: alt.crop_name,
        rotationType: alt.rotation_type
      }))
    };
  }

  async findAlternatives(previousCropId: string): Promise<any[]> {
    return this.rotationRulesRepository.findAlternativeCrops(previousCropId, 0);
  }

  async findAlternativesWithRecommendation(plotId: string): Promise<any> {
    const recentPlantings = await this.plantingRepository.findRecentByPlot(plotId, 1);
    
    if (recentPlantings.length === 0) {
      return {
        message: 'No previous plantings found. Any crop can be planted.',
        recommendations: []
      };
    }

    const lastPlanting = recentPlantings[0];
    const previousCropId = lastPlanting.crop_catalog_id;
    const alternatives = await this.rotationRulesRepository.findAlternativeCrops(previousCropId, 10);

    const grouped = {
      highly_recommended: alternatives.filter(a => a.rotation_type === 'highly_recommended'),
      recommended: alternatives.filter(a => a.rotation_type === 'recommended'),
      neutral: alternatives.filter(a => a.rotation_type === 'neutral'),
      cautionary: alternatives.filter(a => a.rotation_type === 'cautionary')
    };

    return {
      previousCrop: lastPlanting.crop_name,
      message: `Based on ${lastPlanting.crop_name}, here are recommended crops for the next planting:`,
      recommendations: grouped
    };
  }
}
