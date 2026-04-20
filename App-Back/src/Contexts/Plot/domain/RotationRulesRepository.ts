export interface CropRotationRule {
  id: string;
  previousCropId: string;
  nextCropId: string;
  previousCropName: string;
  nextCropName: string;
  rotationType: 'highly_recommended' | 'recommended' | 'neutral' | 'cautionary' | 'discouraged' | 'prohibited';
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

export interface RotationRecommendation {
  isSafe: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule?: CropRotationRule;
  alternatives?: Array<{
    cropId: string;
    cropName: string;
    rotationType: string;
  }>;
}
