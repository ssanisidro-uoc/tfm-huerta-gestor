import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

interface CropData {
  common_name: string;
  scientific_name: string | null;
  family: string | null;
  category: string;
  lifecycle: string;
  growth_habit: string | null;
  days_to_harvest_min: number;
  days_to_harvest_max: number;
  days_to_germination: number | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  optimal_temperature_min_c: number | null;
  optimal_temperature_max_c: number | null;
  frost_tolerant: boolean;
  heat_tolerant: boolean;
  sun_requirement: string;
  min_sun_hours: number;
  shade_tolerance: string | null;
  min_soil_ph: number | null;
  max_soil_ph: number | null;
  soil_depth_requirement: string | null;
  soil_fertility_requirement: string | null;
  water_requirement: string;
  drought_tolerant: boolean;
  waterlogging_tolerant: boolean;
  recommended_spacing_cm: number | null;
  recommended_row_spacing_cm: number | null;
  seed_depth_cm: number | null;
  sowing_start_month: number | null;
  sowing_end_month: number | null;
  harvest_start_month: number | null;
  harvest_end_month: number | null;
  rotation_group: string | null;
  years_before_replant: number | null;
  pest_resistance_level: string | null;
  nitrogen_fixer: boolean;
  attracts_pollinators: boolean;
  attracts_beneficial_insects: boolean;
  average_yield_kg_per_m2: number | null;
  harvest_type: string | null;
  description: string | null;
  growing_tips: string | null;
  culinary_uses: string | null;
}

const COLUMNS = [
  'common_name', 'scientific_name', 'family', 'category', 'lifecycle', 'growth_habit',
  'days_to_harvest_min', 'days_to_harvest_max', 'days_to_germination',
  'min_temperature_c', 'max_temperature_c', 'optimal_temperature_min_c', 'optimal_temperature_max_c',
  'frost_tolerant', 'heat_tolerant', 'sun_requirement', 'min_sun_hours', 'shade_tolerance',
  'min_soil_ph', 'max_soil_ph', 'soil_depth_requirement', 'soil_fertility_requirement',
  'water_requirement', 'drought_tolerant', 'waterlogging_tolerant',
  'recommended_spacing_cm', 'recommended_row_spacing_cm', 'seed_depth_cm',
  'sowing_start_month', 'sowing_end_month', 'harvest_start_month', 'harvest_end_month',
  'rotation_group', 'years_before_replant', 'pest_resistance_level',
  'nitrogen_fixer', 'attracts_pollinators', 'attracts_beneficial_insects',
  'average_yield_kg_per_m2', 'harvest_type',
  'description', 'growing_tips', 'culinary_uses'
];

function getValues(crop: CropData): any[] {
  return [
    crop.common_name,
    crop.scientific_name,
    crop.family,
    crop.category,
    crop.lifecycle,
    crop.growth_habit,
    crop.days_to_harvest_min,
    crop.days_to_harvest_max,
    crop.days_to_germination,
    crop.min_temperature_c,
    crop.max_temperature_c,
    crop.optimal_temperature_min_c,
    crop.optimal_temperature_max_c,
    crop.frost_tolerant,
    crop.heat_tolerant,
    crop.sun_requirement,
    crop.min_sun_hours,
    crop.shade_tolerance,
    crop.min_soil_ph,
    crop.max_soil_ph,
    crop.soil_depth_requirement,
    crop.soil_fertility_requirement,
    crop.water_requirement,
    crop.drought_tolerant,
    crop.waterlogging_tolerant,
    crop.recommended_spacing_cm,
    crop.recommended_row_spacing_cm,
    crop.seed_depth_cm,
    crop.sowing_start_month,
    crop.sowing_end_month,
    crop.harvest_start_month,
    crop.harvest_end_month,
    crop.rotation_group,
    crop.years_before_replant,
    crop.pest_resistance_level,
    crop.nitrogen_fixer,
    crop.attracts_pollinators,
    crop.attracts_beneficial_insects,
    crop.average_yield_kg_per_m2,
    crop.harvest_type,
    crop.description,
    crop.growing_tips,
    crop.culinary_uses,
  ];
}

async function fetchAragonData(): Promise<any[]> {
  console.log('📡 Fetching data from Aragón Open Data...');
  
  const herbaceousUrl = 'https://opendata.aragon.es/GA_OD_Core/download?resource_id=82&formato=json&_pageSize=1000';
  const woodyUrl = 'https://opendata.aragon.es/GA_OD_Core/download?resource_id=84&formato=json&_pageSize=1000';
  
  try {
    const [herbaceousRes, woodyRes] = await Promise.all([
      fetch(herbaceousUrl),
      fetch(woodyUrl)
    ]);
    
    const herbaceousData = await herbaceousRes.json();
    const woodyData = await woodyRes.json();
    
    const herbaceousCrops = Array.isArray(herbaceousData) ? herbaceousData : (herbaceousData.result?.records || []);
    const woodyCrops = Array.isArray(woodyData) ? woodyData : (woodyData.result?.records || []);
    
    console.log(`   - Herbaceous crops: ${herbaceousCrops.length}`);
    console.log(`   - Woody crops: ${woodyCrops.length}`);
    
    return [...herbaceousCrops, ...woodyCrops];
  } catch (error) {
    console.warn('   ⚠️ Could not fetch from Aragón Open Data, using only embedded data');
    return [];
  }
}

function buildInsertQuery(columns: string[]): string {
  const columnList = columns.join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  
  return `
    INSERT INTO crop_catalog (${columnList})
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING
    RETURNING id, common_name;
  `;
}

function simplifyCrop(crop: any): CropData {
  return {
    common_name: crop.common_name,
    scientific_name: crop.scientific_name || null,
    family: crop.family || null,
    category: crop.category || 'vegetable_fruit',
    lifecycle: crop.lifecycle || 'annual',
    growth_habit: crop.growth_habit || null,
    days_to_harvest_min: crop.days_to_harvest_min || 60,
    days_to_harvest_max: crop.days_to_harvest_max || 90,
    days_to_germination: crop.days_to_germination || null,
    min_temperature_c: crop.min_temperature_c || null,
    max_temperature_c: crop.max_temperature_c || null,
    optimal_temperature_min_c: crop.optimal_temperature_min_c || null,
    optimal_temperature_max_c: crop.optimal_temperature_max_c || null,
    frost_tolerant: crop.frost_tolerant || false,
    heat_tolerant: crop.heat_tolerant || false,
    sun_requirement: crop.sun_requirement || 'full_sun',
    min_sun_hours: crop.min_sun_hours || 6,
    shade_tolerance: crop.shade_tolerance || null,
    min_soil_ph: crop.min_soil_ph || null,
    max_soil_ph: crop.max_soil_ph || null,
    soil_depth_requirement: crop.soil_depth_requirement || null,
    soil_fertility_requirement: crop.soil_fertility_requirement || null,
    water_requirement: crop.water_requirement || 'medium',
    drought_tolerant: crop.drought_tolerant || false,
    waterlogging_tolerant: crop.waterlogging_tolerant || false,
    recommended_spacing_cm: crop.recommended_spacing_cm || null,
    recommended_row_spacing_cm: crop.recommended_row_spacing_cm || null,
    seed_depth_cm: crop.seed_depth_cm || null,
    sowing_start_month: crop.sowing_start_month || null,
    sowing_end_month: crop.sowing_end_month || null,
    harvest_start_month: crop.harvest_start_month || null,
    harvest_end_month: crop.harvest_end_month || null,
    rotation_group: crop.rotation_group || null,
    years_before_replant: crop.years_before_replant || null,
    pest_resistance_level: crop.pest_resistance_level || null,
    nitrogen_fixer: crop.nitrogen_fixer || false,
    attracts_pollinators: crop.attracts_pollinators || false,
    attracts_beneficial_insects: crop.attracts_beneficial_insects || false,
    average_yield_kg_per_m2: crop.average_yield_kg_per_m2 || null,
    harvest_type: crop.harvest_type || null,
    description: crop.description || null,
    growing_tips: crop.growing_tips || null,
    culinary_uses: crop.culinary_uses || null,
  };
}

async function seedCrops(pool: pg.Pool) {
  console.log('\n🌱 Starting crop catalog seed...\n');
  
  const dataPath = path.join(__dirname, 'data', 'crops-data.json');
  const embeddedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const embeddedCropsRaw = embeddedData.crops;
  
  const embeddedCrops = embeddedCropsRaw.map(simplifyCrop);
  
  console.log(`📦 Loaded ${embeddedCrops.length} embedded crops`);
  
  const aragonCrops = await fetchAragonData();
  
  const allCrops = [...embeddedCrops];
  
  if (aragonCrops.length > 0) {
    console.log(`\n🔄 Mapping Aragón data to crop catalog...`);
    
    const existingNames = new Set(embeddedCrops.map((c: CropData) => c.common_name.toLowerCase()));
    
    let newCount = 0;
    for (const aragonCrop of aragonCrops) {
      const name = aragonCrop.CULTIVO || aragonCrop.cultivo || aragonCrop.NOMBRE || aragonCrop.nombre || '';
      if (name && !existingNames.has(name.toLowerCase())) {
        allCrops.push({
          common_name: name,
          scientific_name: null,
          family: aragonCrop.FAMILIA || aragonCrop.familia || null,
          category: 'vegetable_fruit',
          lifecycle: 'annual',
          growth_habit: null,
          days_to_harvest_min: 60,
          days_to_harvest_max: 90,
          days_to_germination: null,
          min_temperature_c: null,
          max_temperature_c: null,
          optimal_temperature_min_c: null,
          optimal_temperature_max_c: null,
          frost_tolerant: false,
          heat_tolerant: false,
          sun_requirement: 'full_sun',
          min_sun_hours: 6,
          shade_tolerance: null,
          min_soil_ph: null,
          max_soil_ph: null,
          soil_depth_requirement: null,
          soil_fertility_requirement: null,
          water_requirement: 'medium',
          drought_tolerant: false,
          waterlogging_tolerant: false,
          recommended_spacing_cm: null,
          recommended_row_spacing_cm: null,
          seed_depth_cm: null,
          sowing_start_month: null,
          sowing_end_month: null,
          harvest_start_month: null,
          harvest_end_month: null,
          rotation_group: null,
          years_before_replant: null,
          pest_resistance_level: null,
          nitrogen_fixer: false,
          attracts_pollinators: false,
          attracts_beneficial_insects: false,
          average_yield_kg_per_m2: null,
          harvest_type: null,
          description: `Cultivo de Aragón: ${name}`,
          growing_tips: null,
          culinary_uses: null,
        });
        newCount++;
        existingNames.add(name.toLowerCase());
      }
    }
    
    console.log(`   - New crops from Aragón: ${newCount}`);
  }
  
  console.log(`\n📊 Total crops to insert: ${allCrops.length}`);
  
  const insertQuery = buildInsertQuery(COLUMNS);
  
  let insertedCount = 0;
  let updatedCount = 0;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const crop of allCrops) {
      const values = getValues(crop);
      
      try {
        const result = await client.query(insertQuery, values);
        
        if (result.rows.length > 0) {
          const wasInserted = await client.query(
            "SELECT 1 FROM crop_catalog WHERE common_name = $1 AND created_at = updated_at",
            [crop.common_name]
          );
          
          if (wasInserted.rows.length > 0) {
            insertedCount++;
          } else {
            updatedCount++;
          }
        }
      } catch (cropError: any) {
        console.error(`❌ Error inserting ${crop.common_name}: ${cropError.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\n✅ Seed completed successfully!`);
    console.log(`   - New crops inserted: ${insertedCount}`);
    console.log(`   - Crops updated: ${updatedCount}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('🌱 Crop Catalog Seed Script');
  console.log('='.repeat(50));
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tfm',
  });
  
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'crop_catalog'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('\n❌ Error: crop_catalog table does not exist!');
      console.log('   Please run the database migrations first.');
      process.exit(1);
    }
    
    const countResult = await pool.query('SELECT COUNT(*) FROM crop_catalog');
    const currentCount = parseInt(countResult.rows[0].count);
    console.log(`\n📊 Current crops in database: ${currentCount}`);
    
    await seedCrops(pool);
    
    const finalCount = await pool.query('SELECT COUNT(*) FROM crop_catalog');
    console.log(`📊 Final crops in database: ${parseInt(finalCount.rows[0].count)}`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
