import { CropCompatibility } from '../../domain/CropCompatibility/CropCompatibility';
import { CropCompatibilityRepository } from '../../domain/CropCompatibilityRepository';
import { PostgresRepository } from '../../../Shared/infrastructure/persistence/postgres/PostgresRepository';
import PostgresConfig from '../../../Shared/infrastructure/persistence/postgres/PostgresConfig';
import { Pool } from 'pg';

export class PostgresCropCompatibilityRepository extends PostgresRepository implements CropCompatibilityRepository {
  constructor(pool: Promise<Pool>, config: PostgresConfig) {
    super(pool, config);
  }

  protected tableName(): string {
    return 'crop_compatibilities';
  }

  async save(compatibility: CropCompatibility): Promise<void> {
    const data = compatibility.to_persistence();

    const query: string = `
      INSERT INTO crop_compatibilities (
        id, crop_catalog_id, companion_crop_catalog_id, compatibility_type,
        compatibility_strength, severity_level, primary_effect, secondary_effects,
        mechanism, description, practical_tips, evidence_level, source_type,
        source_references, confidence_score, optimal_distance_cm, min_distance_cm,
        max_distance_cm, recommended_ratio, planting_arrangement, effective_growth_stages,
        climate_zones_applicable, season_dependency, is_verified, verified_by,
        verified_at, user_rating_avg, user_rating_count, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
      ON CONFLICT (id) DO UPDATE SET
        compatibility_type = $4,
        compatibility_strength = $5,
        severity_level = $6,
        primary_effect = $7,
        secondary_effects = $8,
        mechanism = $9,
        description = $10,
        practical_tips = $11,
        evidence_level = $12,
        source_type = $13,
        source_references = $14,
        confidence_score = $16,
        optimal_distance_cm = $17,
        min_distance_cm = $18,
        max_distance_cm = $19,
        recommended_ratio = $20,
        planting_arrangement = $21,
        effective_growth_stages = $22,
        climate_zones_applicable = $23,
        season_dependency = $24,
        is_verified = $25,
        user_rating_avg = $27,
        user_rating_count = $28,
        is_active = $29,
        updated_at = $33
    `;

    const values = [
      data.id, data.crop_catalog_id, data.companion_crop_catalog_id, data.compatibility_type,
      data.compatibility_strength, data.severity_level, data.primary_effect, data.secondary_effects,
      data.mechanism, data.description, data.practical_tips, data.evidence_level, data.source_type,
      data.source_references, data.confidence_score, data.optimal_distance_cm, data.min_distance_cm,
      data.max_distance_cm, data.recommended_ratio, data.planting_arrangement, data.effective_growth_stages,
      data.climate_zones_applicable, data.season_dependency, data.is_verified, data.verified_by,
      data.verified_at, data.user_rating_avg, data.user_rating_count, data.is_active, data.created_at, data.updated_at
    ];

    await this.query(query, values);
  }

  async search_by_id(id: string): Promise<CropCompatibility | null> {
    const query: string = 'SELECT * FROM crop_compatibilities WHERE id = $1';

    const result = await this.query<any>(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return CropCompatibility.from_persistence(result.rows[0]);
  }

  async find_by_crop_id(crop_catalog_id: string): Promise<CropCompatibility[]> {
    const query: string = `
      SELECT * FROM crop_compatibilities 
      WHERE (crop_catalog_id = $1 OR companion_crop_catalog_id = $1)
      AND is_active = true
    `;

    const result = await this.query<any>(query, [crop_catalog_id]);
    return result.rows.map((row) => CropCompatibility.from_persistence(row));
  }

  async find_companions(crop_catalog_id: string): Promise<CropCompatibility[]> {
    const query: string = `
      SELECT * FROM crop_compatibilities 
      WHERE (crop_catalog_id = $1 OR companion_crop_catalog_id = $1)
      AND compatibility_type IN ('highly_beneficial', 'beneficial')
      AND is_active = true
      ORDER BY compatibility_strength DESC
    `;

    const result = await this.query<any>(query, [crop_catalog_id]);
    return result.rows.map((row) => CropCompatibility.from_persistence(row));
  }

  async find_incompatibilities(crop_catalog_id: string): Promise<CropCompatibility[]> {
    const query: string = `
      SELECT * FROM crop_compatibilities 
      WHERE (crop_catalog_id = $1 OR companion_crop_catalog_id = $1)
      AND compatibility_type IN ('incompatible', 'highly_incompatible')
      AND is_active = true
      ORDER BY compatibility_strength ASC
    `;

    const result = await this.query<any>(query, [crop_catalog_id]);
    return result.rows.map((row) => CropCompatibility.from_persistence(row));
  }

  async find_all(options?: { page: number; limit: number }): Promise<CropCompatibility[]> {
    const offset = (options?.page || 1) - 1;
    const limit = options?.limit || 50;

    const query: string = `
      SELECT * FROM crop_compatibilities 
      WHERE is_active = true
      ORDER BY crop_catalog_id, compatibility_strength DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.query<any>(query, [limit, offset * limit]);
    return result.rows.map((row) => CropCompatibility.from_persistence(row));
  }

  async update(compatibility: CropCompatibility): Promise<void> {
    await this.save(compatibility);
  }

  async delete(id: string): Promise<void> {
    const query: string = 'UPDATE crop_compatibilities SET is_active = false WHERE id = $1';
    await this.query(query, [id]);
  }
}