import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

interface LunarRuleSeed {
  moon_phase?: string;
  zodiac_sign?: string;
  zodiac_element?: string;
  biodynamic_day_type?: string;
  agricultural_action: string;
  crop_part?: string;
  recommendation_type: string;
  recommendation_strength: number;
  urgency_level: string;
  title: string;
  description: string;
  practical_advice?: string;
  traditional_saying?: string;
  mechanism_claimed?: string;
  evidence_level: string;
}

const RULES_SEED: LunarRuleSeed[] = [
  {
    moon_phase: 'new_moon',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra en Luna Nueva',
    description: 'La savia está concentrada en las semillas - ideal para sembrar',
    traditional_saying: 'En luna nueva, siembra tu simienta',
    mechanism_claimed: 'La gravedad lunar impulsa la savia hacia abajo',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'full_moon',
    agricultural_action: 'harvesting',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 10,
    urgency_level: 'recommendation',
    title: 'Cosecha en Luna Llena',
    description: 'Máximo contenido energético en frutos y semillas',
    traditional_saying: 'Luna llena, fruta dulce',
    mechanism_claimed: 'Máxima savia en frutos',
    evidence_level: 'traditional'
  },
  {
    biodynamic_day_type: 'root_day',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra Raíces - Día Root',
    description: 'Día óptimo para sembrar tubérculos y raíces',
    evidence_level: 'traditional'
  },
  {
    biodynamic_day_type: 'leaf_day',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra Hojas - Día Leaf',
    description: 'Día óptimo para sembrar verduras de hoja',
    evidence_level: 'traditional'
  },
  {
    biodynamic_day_type: 'fruit_day',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra Frutos - Día Fruit',
    description: 'Día óptimo para sembrar frutales y frutos',
    evidence_level: 'traditional'
  },
  {
    biodynamic_day_type: 'flower_day',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra Flores - Día Flower',
    description: 'Día óptimo para sembrar flores y brassicáceas',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'new_moon',
    agricultural_action: 'harvesting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Cosecha raíces en Luna Nueva',
    description: 'Menos humedad en tubérculos - mejor conservación',
    traditional_saying: 'Luna nueva, cosecha segura',
    mechanism_claimed: 'Menor contenido de agua en raíces',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'waxing_crescent',
    agricultural_action: 'sowing',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Siembra hojas en Luna Creciente',
    description: 'Crecimiento activo favorece desarrollo de hojas',
    traditional_saying: 'Hojas verdes en luna creciente',
    mechanism_claimed: 'Savia sube con la luna creciente',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'first_quarter',
    agricultural_action: 'transplanting',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Trasplanta en Cuarto Creciente',
    description: 'Mayor fuerza de enraizamiento y recuperación',
    traditional_saying: 'Cuarto creciente, trasplanta y espera',
    mechanism_claimed: 'Crecimiento radicular optimizado',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'full_moon',
    agricultural_action: 'harvesting',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 10,
    urgency_level: 'recommendation',
    title: 'Cosecha frutas en Luna Llena',
    description: 'Máximo contenido energético - mejor sabor',
    traditional_saying: 'Luna llena, fruta más dulce',
    mechanism_claimed: 'Máxima savia en frutos',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'full_moon',
    agricultural_action: 'harvesting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Cosecha flores en Luna Llena',
    description: 'Flores más aromáticas y vistosas',
    traditional_saying: 'Luna llena, flores a mansalva',
    mechanism_claimed: 'Mayor presencia de aceites esenciales',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'last_quarter',
    agricultural_action: 'pruning',
    recommendation_type: 'recommended',
    recommendation_strength: 6,
    urgency_level: 'suggestion',
    title: 'Poda en Cuarto Menguante',
    description: 'Menos sangrado de savio - cicatrización más rápida',
    traditional_saying: 'Podar en menguante sana la planta',
    mechanism_claimed: 'Menor presión de savia = menos flujo',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'last_quarter',
    agricultural_action: 'weed_control',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 8,
    urgency_level: 'recommendation',
    title: 'Desmalezar en Cuarto Menguante',
    description: 'Malezas más fáciles de eliminar - menos rebrote',
    traditional_saying: 'Menguante, malezas menos',
    mechanism_claimed: 'Menor crecimiento de malezas',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'new_moon',
    agricultural_action: 'fertilizing',
    recommendation_type: 'recommended',
    recommendation_strength: 6,
    urgency_level: 'suggestion',
    title: 'Fertiliza en Luna Nueva',
    description: 'Nutrientes se absorben mejor hacia las raíces',
    traditional_saying: 'Nueva luna, nueva esperanza',
    mechanism_claimed: 'Savia concentrada en raíces',
    evidence_level: 'traditional'
  },
  {
    moon_phase: 'full_moon',
    agricultural_action: 'composting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Inicia compost en Luna Llena',
    description: 'Actividad microbiana óptima para decomposición',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'aries',
    zodiac_element: 'fire',
    agricultural_action: 'sowing',
    recommendation_type: 'not_recommended',
    recommendation_strength: -3,
    urgency_level: 'warning',
    title: 'Evita sembrar en Aries',
    description: 'Signo seco - poco favorable para germinación',
    practical_advice: 'Mejor para podar y trabajar el suelo',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'taurus',
    zodiac_element: 'earth',
    agricultural_action: 'sowing',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Siembra en Tauro',
    description: 'Signo fértil - buen desarrollo radicular',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'cancer',
    zodiac_element: 'water',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra en Cancer',
    description: 'Signo más fértil - ideal para la mayoría de cultivos',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'leo',
    zodiac_element: 'fire',
    agricultural_action: 'harvesting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Cosecha en Leo',
    description: 'Signo seco - frutos se conservarán mejor',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'virgo',
    zodiac_element: 'earth',
    agricultural_action: 'transplanting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Trasplanta en Virgo',
    description: 'Buen desarrollo radicular',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'scorpio',
    zodiac_element: 'water',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 9,
    urgency_level: 'recommendation',
    title: 'Siembra en Escorpión',
    description: 'Signo muy fértil - óptimo para trasplantes',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'sagittarius',
    zodiac_element: 'fire',
    agricultural_action: 'harvesting',
    recommendation_type: 'recommended',
    recommendation_strength: 7,
    urgency_level: 'suggestion',
    title: 'Cosecha en Sagitario',
    description: 'Ideal para cosechas destinadas a conservación',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'capricorn',
    zodiac_element: 'earth',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 8,
    urgency_level: 'recommendation',
    title: 'Siembra en Capricornio',
    description: 'Segundo signo más fértil - excelente para raíces',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'pisces',
    zodiac_element: 'water',
    agricultural_action: 'sowing',
    recommendation_type: 'highly_recommended',
    recommendation_strength: 8,
    urgency_level: 'recommendation',
    title: 'Siembra en Piscis',
    description: 'Signo muy fértil - buen desarrollo general',
    evidence_level: 'traditional'
  },
  {
    zodiac_sign: 'aquarius',
    zodiac_element: 'air',
    agricultural_action: 'sowing',
    recommendation_type: 'not_recommended',
    recommendation_strength: -3,
    urgency_level: 'warning',
    title: 'Evita sembrar en Acuario',
    description: 'Signo variable - resultados impredecibles',
    evidence_level: 'traditional'
  }
];

async function seedLunarRules(pool: Pool): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const existingCount = await client.query('SELECT COUNT(*) FROM lunar_agricultural_rules WHERE is_active = true');
    console.log(`Existing rules: ${existingCount.rows[0].count}`);

    for (const rule of RULES_SEED) {
      await client.query(
        `INSERT INTO lunar_agricultural_rules (
          moon_phase, zodiac_sign, zodiac_element, biodynamic_day_type,
          agricultural_action, crop_part, recommendation_type,
          recommendation_strength, urgency_level, title, description,
          practical_advice, traditional_saying, mechanism_claimed,
          evidence_level, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)`,
        [
          rule.moon_phase || null,
          rule.zodiac_sign || null,
          rule.zodiac_element || null,
          rule.biodynamic_day_type || null,
          rule.agricultural_action,
          rule.crop_part || null,
          rule.recommendation_type,
          rule.recommendation_strength,
          rule.urgency_level,
          rule.title,
          rule.description,
          rule.practical_advice || null,
          rule.traditional_saying || null,
          rule.mechanism_claimed || null,
          rule.evidence_level
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${RULES_SEED.length} lunar rules`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tfm'
  });

  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'lunar_agricultural_rules'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('Error: lunar_agricultural_rules table does not exist!');
      process.exit(1);
    }

    await seedLunarRules(pool);

    const count = await pool.query('SELECT COUNT(*) FROM lunar_agricultural_rules WHERE is_active = true');
    console.log(`Total lunar rules in database: ${count.rows[0].count}`);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();