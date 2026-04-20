import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

interface CompatibilitySeed {
  crop_name: string;
  companion_name: string;
  compatibility_type: string;
  compatibility_strength: number;
  severity_level?: string;
  primary_effect: string;
  description?: string;
  mechanism?: string;
}

const COMPATIBILITIES_SEED: CompatibilitySeed[] = [
  { crop_name: 'tomate', companion_name: 'albahaca', compatibility_type: 'highly_beneficial', compatibility_strength: 10, primary_effect: 'pest_repellent', description: 'Repele mosca', mechanism: 'Volatiles' },
  { crop_name: 'tomate', companion_name: 'zanahoria', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'space_optimization', description: 'Suelta suelo', mechanism: 'Raices' },
  { crop_name: 'tomate', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Olor' },
  { crop_name: 'tomate', companion_name: 'perejil', compatibility_type: 'beneficial', compatibility_strength: 5, primary_effect: 'pollinator_attraction', description: 'Attrae', mechanism: 'Flores' },
  { crop_name: 'tomate', companion_name: 'patata', compatibility_type: 'incompatible', compatibility_strength: -6, severity_level: 'severe', primary_effect: 'disease_vector', description: 'Mildiu', mechanism: 'Enfermedad' },
  { crop_name: 'tomate', companion_name: 'maíz', compatibility_type: 'cautionary', compatibility_strength: -3, primary_effect: 'pest_habitat', description: 'Plagas', mechanism: 'Insectos' },
  { crop_name: 'tomate', companion_name: 'col', compatibility_type: 'incompatible', compatibility_strength: -5, severity_level: 'moderate', primary_effect: 'other', description: 'Nutrientes', mechanism: 'Competencia' },

  { crop_name: 'lechuga', companion_name: 'zanahoria', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'space_optimization', description: 'Roots', mechanism: 'Compatible' },
  { crop_name: 'lechuga', companion_name: 'rábano', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'space_optimization', description: 'Marca', mechanism: 'Quick' },
  { crop_name: 'lechuga', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Olor' },
  { crop_name: 'lechuga', companion_name: 'fresa', compatibility_type: 'beneficial', compatibility_strength: 5, primary_effect: 'space_optimization', description: 'Cover', mechanism: 'Nocomp' },

  { crop_name: 'zanahoria', companion_name: 'cebolla', compatibility_type: 'highly_beneficial', compatibility_strength: 9, primary_effect: 'pest_repellent', description: 'Mosca', mechanism: 'Confunde' },
  { crop_name: 'zanahoria', companion_name: 'lechuga', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'space_optimization', description: 'Compatible', mechanism: 'Roots' },
  { crop_name: 'zanahoria', companion_name: 'tomate', compatibility_type: 'beneficial', compatibility_strength: 5, primary_effect: 'space_optimization', description: 'Buena', mechanism: 'Habits' },
  { crop_name: 'zanahoria', companion_name: 'eneldo', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'pollinator_attraction', description: 'Attrae', mechanism: 'Flores' },

  { crop_name: 'pimiento', companion_name: 'albahaca', compatibility_type: 'highly_beneficial', compatibility_strength: 9, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Aceites' },
  { crop_name: 'pimiento', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Olor' },
  { crop_name: 'pimiento', companion_name: 'tomate', compatibility_type: 'neutral', compatibility_strength: 0, primary_effect: 'other', description: 'Enfermedad', mechanism: 'Similar' },

  { crop_name: 'patata', companion_name: 'calabaza', compatibility_type: 'incompatible', compatibility_strength: -5, primary_effect: 'other', description: 'Espacio', mechanism: 'Extenso' },
  { crop_name: 'patata', companion_name: 'pepino', compatibility_type: 'cautionary', compatibility_strength: -3, primary_effect: 'disease_vector', description: 'Enfermedad', mechanism: 'Vuln' },
  { crop_name: 'patata', companion_name: 'tomate', compatibility_type: 'incompatible', compatibility_strength: -7, primary_effect: 'disease_vector', description: 'Mildiu', mechanism: 'Blight' },

  { crop_name: 'col', companion_name: 'apio', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'pest_repellent', description: 'Mariposa', mechanism: 'Confunde' },
  { crop_name: 'col', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Olor' },
  { crop_name: 'col', companion_name: 'puerro', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'pest_repellent', description: 'Mosca', mechanism: 'Repel' },
  { crop_name: 'col', companion_name: 'fresa', compatibility_type: 'incompatible', compatibility_strength: -4, primary_effect: 'other', description: 'Nutri', mechanism: 'Feeders' },
  { crop_name: 'col', companion_name: 'tomate', compatibility_type: 'cautionary', compatibility_strength: -2, primary_effect: 'other', description: 'No opt', mechanism: 'Needs' },

  { crop_name: 'pepino', companion_name: 'judía', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'other', description: 'Nitrogeno', mechanism: 'Nfix' },
  { crop_name: 'pepino', companion_name: 'guisante', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'other', description: 'N', mechanism: 'Legume' },
  { crop_name: 'pepino', companion_name: 'rábano', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'space_optimization', description: 'Marca', mechanism: 'Quick' },
  { crop_name: 'pepino', companion_name: 'patata', compatibility_type: 'incompatible', compatibility_strength: -6, primary_effect: 'disease_vector', description: 'Enfermedad', mechanism: 'Issues' },

  { crop_name: 'judía', companion_name: 'maíz', compatibility_type: 'highly_beneficial', compatibility_strength: 10, primary_effect: 'other', description: 'Tutor', mechanism: 'Climb' },
  { crop_name: 'judía', companion_name: 'pepino', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'other', description: 'Nitrogeno', mechanism: 'Nfix' },
  { crop_name: 'judía', companion_name: 'patata', compatibility_type: 'cautionary', compatibility_strength: -2, primary_effect: 'other', description: 'Competen', mechanism: 'Nutri' },
  { crop_name: 'judía', companion_name: 'cebolla', compatibility_type: 'incompatible', compatibility_strength: -5, primary_effect: 'other', description: 'Inhibe', mechanism: 'Allel' },

  { crop_name: 'calabacín', companion_name: 'maíz', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'shade_provision', description: 'Sombra', mechanism: 'Shelter' },
  { crop_name: 'calabacín', companion_name: 'judía', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'other', description: 'Nitrogeno', mechanism: 'Legume' },
  { crop_name: 'calabacín', companion_name: 'rábano', compatibility_type: 'beneficial', compatibility_strength: 5, primary_effect: 'space_optimization', description: 'Space', mechanism: 'Comp' },

  { crop_name: 'berenjena', companion_name: 'judía', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'other', description: 'Nitrogeno', mechanism: 'Nfix' },
  { crop_name: 'berenjena', companion_name: 'pimiento', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'disease_suppression', description: 'Plagas', mechanism: 'Similar' },
  { crop_name: 'berenjena', companion_name: 'tomate', compatibility_type: 'cautionary', compatibility_strength: -2, primary_effect: 'disease_vector', description: 'Enfermedad', mechanism: 'Disease' },

  { crop_name: 'fresa', companion_name: 'lechuga', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'space_optimization', description: 'Cover', mechanism: 'Space' },
  { crop_name: 'fresa', companion_name: 'espinaca', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'space_optimization', description: 'Good', mechanism: 'Roots' },
  { crop_name: 'fresa', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Olor' },
  { crop_name: 'fresa', companion_name: 'col', compatibility_type: 'incompatible', compatibility_strength: -4, primary_effect: 'other', description: 'No vec', mechanism: 'Nutri' },

  { crop_name: 'cebolla', companion_name: 'zanahoria', compatibility_type: 'highly_beneficial', compatibility_strength: 9, primary_effect: 'pest_repellent', description: 'Mutua', mechanism: 'Repel' },
  { crop_name: 'cebolla', companion_name: 'lechuga', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'space_optimization', description: 'Compatible', mechanism: 'Space' },
  { crop_name: 'cebolla', companion_name: 'remolacha', compatibility_type: 'beneficial', compatibility_strength: 5, primary_effect: 'space_optimization', description: 'Good', mechanism: 'Growth' },
  { crop_name: 'cebolla', companion_name: 'judía', compatibility_type: 'incompatible', compatibility_strength: -5, primary_effect: 'other', description: 'Inhibe', mechanism: 'Allel' },

  { crop_name: 'ajo', companion_name: 'tomate', compatibility_type: 'beneficial', compatibility_strength: 8, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Allicin' },
  { crop_name: 'ajo', companion_name: 'fresa', compatibility_type: 'beneficial', compatibility_strength: 9, primary_effect: 'pest_repellent', description: 'Excelent', mechanism: 'Det' },
  { crop_name: 'ajo', companion_name: 'col', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Det' },
  { crop_name: 'ajo', companion_name: 'pimiento', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'pest_repellent', description: 'Repele', mechanism: 'Det' },

  { crop_name: 'puerro', companion_name: 'cebolla', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'pest_repellent', description: 'Mosca', mechanism: 'Mutual' },
  { crop_name: 'puerro', companion_name: 'zanahoria', compatibility_type: 'highly_beneficial', compatibility_strength: 10, primary_effect: 'pest_repellent', description: 'Clasicos', mechanism: 'Protect' },
  { crop_name: 'puerro', companion_name: 'apio', compatibility_type: 'beneficial', compatibility_strength: 6, primary_effect: 'space_optimization', description: 'Neighbors', mechanism: 'Habits' },

  { crop_name: 'maíz', companion_name: 'calabaza', compatibility_type: 'beneficial', compatibility_strength: 7, primary_effect: 'space_optimization', description: 'Sisters', mechanism: 'Comp' },
  { crop_name: 'maíz', companion_name: 'judía', compatibility_type: 'highly_beneficial', compatibility_strength: 10, primary_effect: 'other', description: 'Fijan N', mechanism: 'Nfix' },
];

function normalizeName(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function seedCropCompatibilities(pool: any): Promise<void> {
  console.log('Seeding crop compatibilities...');

  const cropsResult = await pool.query(`
    SELECT id, LOWER(common_name) as name 
    FROM crop_catalog 
    WHERE is_active = true
  `);
  
  const cropMap = new Map<string, string>();
  for (const row of cropsResult.rows) {
    cropMap.set(normalizeName(row.name), row.id);
  }

  console.log(`Found ${cropMap.size} crops in database`);

  let inserted = 0;
  let skipped = 0;

  for (const comp of COMPATIBILITIES_SEED) {
    const cropId = cropMap.get(normalizeName(comp.crop_name));
    const companionId = cropMap.get(normalizeName(comp.companion_name));

    if (!cropId || !companionId) {
      console.log(`Skipping ${comp.crop_name} -> ${comp.companion_name}: not found`);
      skipped++;
      continue;
    }

    const existing = await pool.query(
      `SELECT id FROM crop_compatibilities 
       WHERE crop_catalog_id = $1 AND companion_crop_catalog_id = $2 
       AND compatibility_type = $3 AND is_active = true`,
      [cropId, companionId, comp.compatibility_type]
    );

    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

const isIncompatible = comp.compatibility_type.includes('incompatible');
    const severity = isIncompatible 
      ? (comp.compatibility_strength < -5 ? 'severe' : 'moderate')
      : null;
    
    const insertQuery = `
      INSERT INTO crop_compatibilities (
        id, crop_catalog_id, companion_crop_catalog_id, compatibility_type,
        compatibility_strength, severity_level, primary_effect, evidence_level, source_type, 
        confidence_score, is_verified, is_active, created_at, updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'traditional', 'expert_recommendation', 8, true, true, NOW(), NOW())
    `;
    
    await pool.query(insertQuery, [cropId, companionId, comp.compatibility_type, comp.compatibility_strength, severity, comp.primary_effect]);

    inserted++;
  }

  console.log(`Crop compatibilities seeded: ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await seedCropCompatibilities(pool);
  } finally {
    await pool.end();
  }
}

main();