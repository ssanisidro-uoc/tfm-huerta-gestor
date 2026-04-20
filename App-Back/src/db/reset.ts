import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function main() {
  console.log(`
${COLORS.yellow}⚠ ATENCIÓN: Esta acción eliminará TODOS los datos${COLORS.reset}
  - Base de datos: ${process.env.DB_NAME}
  - Todos los cultivos, siembras, tareas, etc.
  - Esta acción no se puede deshacer.
`);

  const answer = await new Promise<string>((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('¿Estás seguro? Escribe "YES" para continuar: ', (ans: string) => {
      rl.close();
      resolve(ans);
    });
  });

  if (answer !== 'YES') {
    log('Operación cancelada', 'yellow');
    process.exit(0);
  }

  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    const dbName = process.env.DB_NAME!;
    
    log(`Eliminando base de datos '${dbName}'...`, 'yellow');
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    log(`Base de datos '${dbName}' eliminada`, 'green');

    log(`Creando base de datos '${dbName}'...`, 'yellow');
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    log(`Base de datos '${dbName}' creada`, 'green');

    console.log(`
${COLORS.cyan}Base de datos reiniciada. Ejecuta:${COLORS.reset}
  npm run db:setup
`);
  } catch (error: any) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

main();
