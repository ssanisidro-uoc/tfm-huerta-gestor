import config from '../../config';
import PostgresConfig from './PostgresConfig';

const postgresConfig = {
  host: config.get('database.host'),
  port: config.get('database.port'),
  user: config.get('database.username'),
  password: config.get('database.password'),
  database: config.get('database.database'),
  pool_max: 10
};

export class PostgresGarderingConfigFactory {
  static createConfig(): PostgresConfig {
    return postgresConfig;
  }
}
