import { Pool } from 'pg';
import config from './config/index';

export class DatabasePoolFactory {
  static createPool(): Pool {
    const dbConfig = config.get('database');
    return new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database
    });
  }
}
