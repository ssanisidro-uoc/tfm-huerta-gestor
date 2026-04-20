export interface CropRotationRuleResponse {
  id: string;
  previousCropId: string;
  nextCropId: string;
  previousCropName: string;
  nextCropName: string;
  rotationType: string;
  rotationEffectStrength: number;
  severityLevel?: string;
  primaryReason: string;
  secondaryReasons?: string[];
  mechanism?: string;
  soilEffect?: string;
  nitrogenImpact?: string;
  diseaseRisk?: string;
  pestRisk?: string;
  expectedYieldChangePercent?: number;
  minimumGapDays?: number;
  recommendedGapDays?: number;
  evidenceLevel: string;
  description?: string;
}

export interface GetRotationRulesResponse {
  rules: CropRotationRuleResponse[];
  total: number;
  page: number;
  limit: number;
}
