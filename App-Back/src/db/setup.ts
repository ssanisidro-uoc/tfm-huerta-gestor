import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const TABLES_SQL_PATH = path.join(__dirname, '../db/tables/tables.sql');
const ROLES_SQL_PATH = path.join(__dirname, '../db/tables/seed_initial_roles.sql');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logStep(step: number, total: number, message: string) {
  console.log(`\n${COLORS.cyan}[${step}/${total}]${COLORS.reset} ${message}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

async function checkEnvVars(): Promise<boolean> {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    logError(`Faltan variables de entorno: ${missing.join(', ')}`);
    log(`\nPor favor, crea un archivo .env en la raíz del proyecto con:`);
    console.log(`
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=nombre_base_datos
`);
    return false;
  }
  return true;
}

async function createDatabase(): Promise<pg.Pool> {
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    const dbName = process.env.DB_NAME!;
    
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      log(`Creando base de datos '${dbName}'...`, 'yellow');
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      logSuccess(`Base de datos '${dbName}' creada`);
    } else {
      log(`Base de datos '${dbName}' ya existe`, 'cyan');
    }
  } finally {
    await adminPool.end();
  }

  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}

async function executeSQLFile(pool: pg.Pool, filePath: string, description: string): Promise<void> {
  if (!fs.existsSync(filePath)) {
    logError(`Archivo no encontrado: ${filePath}`);
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf-8');
  
  log(`Ejecutando ${description}...`, 'blue');
  
  try {
    await pool.query(sql);
    logSuccess(`${description} completado`);
  } catch (error: any) {
    logError(`Error en ${description}: ${error.message}`);
    throw error;
  }
}

async function runSeedScript(scriptPath: string, scriptName: string): Promise<void> {
  log(`Ejecutando ${scriptName}...`, 'blue');
  
  try {
    const { exec } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      exec(`npx ts-node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          logError(`Error en ${scriptName}`);
          console.error(stderr || error.message);
          reject(error);
        } else {
          logSuccess(`${scriptName} completado`);
          if (stdout) console.log(stdout);
          resolve();
        }
      });
    });
  } catch (error: any) {
    logError(`Error al ejecutar ${scriptName}: ${error.message}`);
    throw error;
  }
}

async function verifyTables(pool: pg.Pool): Promise<void> {
  const tables = [
    'roles', 'users', 'user_preferences', 'user_sessions',
    'gardens', 'user_gardens', 'plots', 'crop_catalog',
    'plantings', 'plantings_harvests', 'tasks',
    'crop_compatibilities', 'planting_associations', 'association_observations',
    'crop_rotation_rules', 'rotation_plans', 'rotation_observations',
    'lunar_calendar', 'lunar_agricultural_rules', 'lunar_task_recommendations',
    'lunar_observations', 'lunar_monthly_calendar',
    'weather_locations', 'weather_daily', 'weather_forecast_accuracy',
    'weather_agricultural_rules', 'weather_alerts', 'weather_observations',
    'weather_api_requests', 'audit_log'
  ];

  log('\nVerificando tablas creadas...', 'cyan');
  
  const result = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  `);

  const existingTables = result.rows.map(r => r.tablename);
  let missingTables: string[] = [];

  for (const table of tables) {
    if (existingTables.includes(table)) {
      log(`  ✓ ${table}`, 'green');
    } else {
      log(`  ✗ ${table}`, 'red');
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    logWarning(`Tablas no creadas: ${missingTables.join(', ')}`);
  } else {
    logSuccess('Todas las tablas creadas correctamente');
  }
}

async function countRecords(pool: pg.Pool): Promise<void> {
  log('\nRegistros en tablas principales:', 'cyan');
  
  const tablesToCheck = [
    { name: 'roles', display: 'Roles' },
    { name: 'crop_catalog', display: 'Cultivos' },
    { name: 'crop_compatibilities', display: 'Compatibilidades' },
    { name: 'lunar_calendar', display: 'Calendario lunar' },
    { name: 'lunar_agricultural_rules', display: 'Reglas lunares' }
  ];

  for (const table of tablesToCheck) {
    try {
      const result = await pool.query(`SELECT COUNT(*) as cnt FROM ${table.name}`);
      const count = result.rows[0].cnt;
      log(`  ${table.display}: ${count}`, 'green');
    } catch (error) {
      log(`  ${table.display}: error al consultar`, 'red');
    }
  }
}

async function main() {
  console.log(`
${COLORS.bright}${COLORS.green}
╔═══════════════════════════════════════════════════════════╗
║          Setup de Base de Datos - Huertis              ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}
`);

  logStep(0, 7, 'Verificando configuración...');
  
  if (!(await checkEnvVars())) {
    process.exit(1);
  }

  logSuccess('Variables de entorno verificadas');

  let pool: pg.Pool | undefined;
  
  try {
    logStep(1, 7, 'Conectando a PostgreSQL...');
    pool = await createDatabase();
    logSuccess('Conexión establecida');

    logStep(2, 7, 'Ejecutando schema principal (tables.sql)...');
    await executeSQLFile(pool, TABLES_SQL_PATH, 'Schema principal');
    
    logStep(3, 7, 'Insertando roles iniciales...');
    await executeSQLFile(pool, ROLES_SQL_PATH, 'Roles iniciales');

    logStep(4, 7, 'Ejecutando seeds...');
    
    log('\n  Ejecutando seed de cultivos...', 'blue');
    await runSeedScript('src/db/seed/crops/index.ts', 'Seed de cultivos');
    
    log('\n  Ejecutando seed de compatibilidades...', 'blue');
    await runSeedScript('src/db/seed/crops/compatibilities.ts', 'Seed de compatibilidades');
    
    log('\n  Ejecutando seed de calendario lunar...', 'blue');
    await runSeedScript('src/db/seed/lunar/calendar.ts', 'Seed calendario lunar');
    
    log('\n  Ejecutando seed de reglas lunares...', 'blue');
    await runSeedScript('src/db/seed/lunar/rules.ts', 'Seed reglas lunares');

    logStep(5, 7, 'Verificando tablas...');
    await verifyTables(pool);

    logStep(6, 7, 'Contando registros...');
    await countRecords(pool!);

    logStep(7, 7, 'Finalizando...');
    await pool!.end();

    console.log(`
${COLORS.bright}${COLORS.green}
╔═══════════════════════════════════════════════════════════╗
║  ✓ Setup completado correctamente                       ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}

${COLORS.cyan}Siguientes pasos:${COLORS.reset}
  1. Crear usuario admin: npm run create:admin
  2. Iniciar servidor: npm run dev
  3. Acceder a http://localhost:3000

${COLORS.yellow}Para reiniciar la base de datos:${COLORS.reset}
  npm run db:reset
`);

  } catch (error: any) {
    logError(`Error durante el setup: ${error.message}`);
    if (pool) await pool.end();
    process.exit(1);
  }
}

main();
