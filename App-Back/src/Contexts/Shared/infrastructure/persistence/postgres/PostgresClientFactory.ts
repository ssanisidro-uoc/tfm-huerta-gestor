import { Pool } from 'pg';
import PostgresConfig from './PostgresConfig';

export class PostgresClientFactory {
  private static pools: { [key: string]: Pool } = {};
  private static config: { [key: string]: PostgresConfig } = {};

  static async createPool(contextName: string, config: PostgresConfig): Promise<Pool> {
    let pool = PostgresClientFactory.getPool(contextName);
    if (!pool) {
      pool = new Pool({
        connectionString: `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
        max: config.pool_max,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });
      PostgresClientFactory.registerConfigPool(config, contextName);
      PostgresClientFactory.registerPool(pool, contextName);
    }
    return pool;
  }
  private static getPool(contextName: string) {
    return PostgresClientFactory.pools[contextName];
  }
  private static registerConfigPool(config: PostgresConfig, contextName: string) {
    PostgresClientFactory.config[contextName] = config;
  }
  private static registerPool(pool: Pool, contextName: string): void {
    PostgresClientFactory.pools[contextName] = pool;
  }
}
