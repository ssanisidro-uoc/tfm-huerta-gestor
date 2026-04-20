import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';
import { CropRotationRule } from '../../domain/RotationRulesRepository';

export class RotationRulesRepository extends PostgresRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'crop_rotation_rules';
  }

  async findRulesForPreviousCrop(previousCropId: string): Promise<CropRotationRule[]> {
    const query = `
      SELECT 
        r.id,
        r.previous_crop_catalog_id as previous_crop_id,
        r.next_crop_catalog_id as next_crop_id,
        pc.common_name as previous_crop_name,
        nc.common_name as next_crop_name,
        r.rotation_type as rotation_type,
        r.rotation_effect_strength as rotation_effect_strength,
        r.severity_level as severity_level,
        r.primary_reason as primary_reason,
        r.secondary_reasons as secondary_reasons,
        r.mechanism as mechanism,
        r.soil_effect as soil_effect,
        r.nitrogen_impact as nitrogen_impact,
        r.disease_risk as disease_risk,
        r.pest_risk as pest_risk,
        r.expected_yield_change_percent as expected_yield_change_percent,
        r.minimum_gap_days as minimum_gap_days,
        r.recommended_gap_days as recommended_gap_days,
        r.evidence_level as evidence_level,
        r.description as description
      FROM crop_rotation_rules r
      JOIN crop_catalog pc ON pc.id = r.previous_crop_catalog_id
      JOIN crop_catalog nc ON nc.id = r.next_crop_catalog_id
      WHERE r.previous_crop_catalog_id = $1
        AND r.is_active = true
      ORDER BY r.rotation_effect_strength DESC
    `;

    const result = await this.query<any>(query, [previousCropId]);
    return result.rows;
  }

  async findRule(previousCropId: string, nextCropId: string): Promise<CropRotationRule | null> {
    const query = `
      SELECT 
        r.id,
        r.previous_crop_catalog_id as previous_crop_id,
        r.next_crop_catalog_id as next_crop_id,
        pc.common_name as previous_crop_name,
        nc.common_name as next_crop_name,
        r.rotation_type as rotation_type,
        r.rotation_effect_strength as rotation_effect_strength,
        r.severity_level as severity_level,
        r.primary_reason as primary_reason,
        r.secondary_reasons as secondary_reasons,
        r.mechanism as mechanism,
        r.soil_effect as soil_effect,
        r.nitrogen_impact as nitrogen_impact,
        r.disease_risk as disease_risk,
        r.pest_risk as pest_risk,
        r.expected_yield_change_percent as expected_yield_change_percent,
        r.minimum_gap_days as minimum_gap_days,
        r.recommended_gap_days as recommended_gap_days,
        r.evidence_level as evidence_level,
        r.description as description
      FROM crop_rotation_rules r
      JOIN crop_catalog pc ON pc.id = r.previous_crop_catalog_id
      JOIN crop_catalog nc ON nc.id = r.next_crop_catalog_id
      WHERE r.previous_crop_catalog_id = $1
        AND r.next_crop_catalog_id = $2
        AND r.is_active = true
    `;

    const result = await this.query<any>(query, [previousCropId, nextCropId]);
    return result.rows[0] || null;
  }

  async findAllRules(page = 1, limit = 50): Promise<{ rules: CropRotationRule[]; total: number }> {
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total FROM crop_rotation_rules WHERE is_active = true
    `;
    const countResult = await this.query<any>(countQuery, []);
    const total = parseInt(countResult.rows[0].total, 10);

    const query = `
      SELECT 
        r.id,
        r.previous_crop_catalog_id as previous_crop_id,
        r.next_crop_catalog_id as next_crop_id,
        pc.common_name as previous_crop_name,
        nc.common_name as next_crop_name,
        r.rotation_type as rotation_type,
        r.rotation_effect_strength as rotation_effect_strength,
        r.severity_level as severity_level,
        r.primary_reason as primary_reason,
        r.evidence_level as evidence_level,
        r.description as description
      FROM crop_rotation_rules r
      JOIN crop_catalog pc ON pc.id = r.previous_crop_catalog_id
      JOIN crop_catalog nc ON nc.id = r.next_crop_catalog_id
      WHERE r.is_active = true
      ORDER BY r.rotation_effect_strength DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.query<any>(query, [limit, offset]);
    return { rules: result.rows, total };
  }

  async findAlternativeCrops(previousCropId: string, minStrength = 5): Promise<any[]> {
    const query = `
      SELECT 
        r.next_crop_catalog_id as crop_id,
        nc.common_name as crop_name,
        nc.category as crop_category,
        r.rotation_type as rotation_type,
        r.rotation_effect_strength as rotation_effect_strength,
        r.primary_reason as primary_reason
      FROM crop_rotation_rules r
      JOIN crop_catalog nc ON nc.id = r.next_crop_catalog_id
      WHERE r.previous_crop_catalog_id = $1
        AND r.rotation_effect_strength >= $2
        AND r.is_active = true
      ORDER BY r.rotation_effect_strength DESC
      LIMIT 10
    `;

    const result = await this.query<any>(query, [previousCropId, minStrength]);
    return result.rows;
  }
}
