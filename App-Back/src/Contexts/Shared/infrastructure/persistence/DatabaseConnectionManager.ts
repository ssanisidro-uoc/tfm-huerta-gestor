import { Pool, PoolConfig, PoolClient } from 'pg';
import { logger } from '../Logger';

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  initialize(config: PoolConfig): Pool {
    if (this.pool) {
      logger.info('Database pool already initialized', 'DatabaseConnectionManager');
      return this.pool;
    }

    logger.info('Initializing database pool...', 'DatabaseConnectionManager');

    this.pool = new Pool({
      ...config,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('connect', () => {
      this.isConnected = true;
      logger.debug('New database connection established', 'DatabaseConnectionManager');
    });

    this.pool.on('error', (err) => {
      logger.error(`Database pool error: ${err.message}`, 'DatabaseConnectionManager');
      this.isConnected = false;
    });

    this.pool.on('remove', () => {
      logger.debug('Database connection removed from pool', 'DatabaseConnectionManager');
    });

    this.testConnection();

    return this.pool;
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool!.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection test successful', 'DatabaseConnectionManager');
    } catch (error) {
      logger.error(`Database connection test failed: ${(error as Error).message}`, 'DatabaseConnectionManager');
      throw error;
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  async getConnection(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.connect();
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info('Database pool closed', 'DatabaseConnectionManager');
    }
  }

  getStatus(): { connected: boolean; poolInitialized: boolean } {
    return {
      connected: this.isConnected,
      poolInitialized: this.pool !== null
    };
  }
}
