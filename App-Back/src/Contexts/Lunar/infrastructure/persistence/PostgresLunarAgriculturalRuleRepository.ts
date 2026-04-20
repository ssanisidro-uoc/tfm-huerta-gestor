import { LunarAgriculturalRule, LunarAgriculturalRuleProps } from '../../domain/LunarAgriculturalRule/LunarAgriculturalRule';
import { LunarAgriculturalRuleRepository, SearchCriteria } from '../../domain/LunarAgriculturalRuleRepository';
import { Pool } from 'pg';

export class PostgresLunarAgriculturalRuleRepository implements LunarAgriculturalRuleRepository {
  constructor(private pool: Pool) {}

  async findById(id: string): Promise<LunarAgriculturalRule | null> {
    const query = 'SELECT * FROM lunar_agricultural_rules WHERE id = $1 AND is_active = true';
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async findByMoonPhase(moonPhase: string): Promise<LunarAgriculturalRule[]> {
    const query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE moon_phase = $1 AND is_active = true
      ORDER BY recommendation_strength DESC
    `;
    const result = await this.pool.query(query, [moonPhase]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByZodiacSign(zodiacSign: string): Promise<LunarAgriculturalRule[]> {
    const query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE zodiac_sign = $1 AND is_active = true
      ORDER BY recommendation_strength DESC
    `;
    const result = await this.pool.query(query, [zodiacSign]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByBiodynamicDay(dayType: string): Promise<LunarAgriculturalRule[]> {
    const query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE biodynamic_day_type = $1 AND is_active = true
      ORDER BY recommendation_strength DESC
    `;
    const result = await this.pool.query(query, [dayType]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByActionAndCropPart(action: string, cropPart?: string): Promise<LunarAgriculturalRule[]> {
    let query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE agricultural_action = $1 AND is_active = true
    `;
    const params: unknown[] = [action];

    if (cropPart) {
      query += ` AND (crop_part = $2 OR crop_part IS NULL OR crop_part = 'all')`;
      params.push(cropPart);
    }

    query += ' ORDER BY recommendation_strength DESC';
    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByDateAndAction(date: Date, action: string, hemisphere: string): Promise<LunarAgriculturalRule[]> {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const biodynamicDays = ['root', 'leaf', 'flower', 'fruit'];
    const dayType = biodynamicDays[dayOfYear % 4];
    const month = date.getMonth() + 1;
    const season = month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';

    const query = `
      SELECT * FROM lunar_agricultural_rules 
      WHERE agricultural_action = $1 
        AND is_active = true
        AND (hemisphere_applicable = $2 OR hemisphere_applicable = 'both')
        AND (season_applicable IS NULL OR season_applicable = '' OR season_applicable = $3)
        AND (
          (biodynamic_day_type IS NULL OR biodynamic_day_type = '')
          OR (biodynamic_day_type = $4)
        )
      ORDER BY recommendation_strength DESC
    `;
    const result = await this.pool.query(query, [action, hemisphere, season, dayType]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async search(criteria: Partial<SearchCriteria>): Promise<LunarAgriculturalRule[]> {
    let query = 'SELECT * FROM lunar_agricultural_rules WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (criteria.moonPhase) {
      query += ` AND moon_phase = $${paramIndex++}`;
      params.push(criteria.moonPhase);
    }
    if (criteria.zodiacSign) {
      query += ` AND zodiac_sign = $${paramIndex++}`;
      params.push(criteria.zodiacSign);
    }
    if (criteria.zodiacElement) {
      query += ` AND zodiac_element = $${paramIndex++}`;
      params.push(criteria.zodiacElement);
    }
    if (criteria.biodynamicDayType) {
      query += ` AND biodynamic_day_type = $${paramIndex++}`;
      params.push(criteria.biodynamicDayType);
    }
    if (criteria.agriculturalAction) {
      query += ` AND agricultural_action = $${paramIndex++}`;
      params.push(criteria.agriculturalAction);
    }
    if (criteria.cropCategory) {
      query += ` AND crop_category = $${paramIndex++}`;
      params.push(criteria.cropCategory);
    }
    if (criteria.recommendationType) {
      query += ` AND recommendation_type = $${paramIndex++}`;
      params.push(criteria.recommendationType);
    }

    query += ' ORDER BY recommendation_strength DESC LIMIT 50';
    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async save(rule: LunarAgriculturalRule): Promise<void> {
    const data = rule.toJSON();

    const query = `
      INSERT INTO lunar_agricultural_rules (
        id, moon_phase, moon_phase_range_min, moon_phase_range_max, zodiac_sign,
        zodiac_element, biodynamic_day_type, applies_to_perigee, applies_to_apogee,
        applies_to_eclipse, agricultural_action, crop_catalog_id, crop_category,
        crop_part, recommendation_type, recommendation_strength, urgency_level,
        title, description, practical_advice, traditional_saying, mechanism_claimed,
        scientific_basis, evidence_level, confidence_score, climate_zones_applicable,
        hemisphere_applicable, season_applicable, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        recommendation_type = $15,
        recommendation_strength = $16,
        updated_at = NOW()
    `;

    await this.pool.query(query, [
      data.id,
      data.moon_phase,
      data.moon_phase_range_min,
      data.moon_phase_range_max,
      data.zodiac_sign,
      data.zodiac_element,
      data.biodynamic_day_type,
      data.applies_to_perigee,
      data.applies_to_apogee,
      data.applies_to_eclipse,
      data.agricultural_action,
      data.crop_catalog_id,
      data.crop_category,
      data.crop_part,
      data.recommendation_type,
      data.recommendation_strength,
      data.urgency_level,
      data.title,
      data.description,
      data.practical_advice,
      data.traditional_saying,
      data.mechanism_claimed,
      data.scientific_basis,
      data.evidence_level,
      data.confidence_score,
      data.climate_zones_applicable,
      data.hemisphere_applicable,
      data.season_applicable,
      true
    ]);
  }

  async saveMany(rules: LunarAgriculturalRule[]): Promise<void> {
    for (const rule of rules) {
      await this.save(rule);
    }
  }

  async count(): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*) as cnt FROM lunar_agricultural_rules WHERE is_active = true'
    );
    return parseInt(result.rows[0].cnt);
  }

  private mapRowToEntity(row: Record<string, unknown>): LunarAgriculturalRule {
    const props: LunarAgriculturalRuleProps = {
      id: row.id as string,
      moonPhase: row.moon_phase as string,
      moonPhaseRangeMin: row.moon_phase_range_min as number,
      moonPhaseRangeMax: row.moon_phase_range_max as number,
      zodiacSign: row.zodiac_sign as string,
      zodiacElement: row.zodiac_element as string,
      biodynamicDayType: row.biodynamic_day_type as string,
      appliesToPerigee: row.applies_to_perigee as boolean,
      appliesToApogee: row.applies_to_apogee as boolean,
      appliesToEclipse: row.applies_to_eclipse as boolean,
      agriculturalAction: row.agricultural_action as string,
      cropCatalogId: row.crop_catalog_id as string,
      cropCategory: row.crop_category as string,
      cropPart: row.crop_part as string,
      recommendationType: row.recommendation_type as string,
      recommendationStrength: row.recommendation_strength as number,
      urgencyLevel: row.urgency_level as string,
      title: row.title as string,
      description: row.description as string,
      practicalAdvice: row.practical_advice as string,
      traditionalSaying: row.traditional_saying as string,
      mechanismClaimed: row.mechanism_claimed as string,
      scientificBasis: row.scientific_basis as string,
      evidenceLevel: row.evidence_level as string,
      confidenceScore: row.confidence_score as number,
      climateZonesApplicable: row.climate_zones_applicable as string[],
      hemisphereApplicable: row.hemisphere_applicable as string,
      seasonApplicable: row.season_applicable as string,
      isActive: row.is_active as boolean
    };

    return new LunarAgriculturalRule(props);
  }
}