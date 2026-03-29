import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import PostgresConfig from './PostgresConfig';

export abstract class PostgresRepository {
  constructor(
    private readonly _pool: Promise<Pool>,
    private readonly config: PostgresConfig
  ) {}

  protected abstract tableName(): string;

  protected pool(): Promise<Pool> {
    return this._pool;
  }

  async getClient(): Promise<PoolClient> {
    const pool = (await this._pool).connect();
    return pool;
  }

  protected async query<T extends QueryResultRow>(
    text: string,
    values: any[]
  ): Promise<QueryResult<T>> {
    let client;
    try {
      client = await this.getClient();
      const result = await client.query<T>({ text, values });
      return result;
    } catch (error) {
      console.error(`Database query error: ${(error as Error).message}`);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  protected async bulk(queries: Array<{ query: string; values: any[] }>): Promise<void> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      for (const { query, values } of queries) {
        await client.query({ text: query, values });
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Database bulk query error: ${(error as Error).message}`);
      throw error;
    } finally {
      client.release();
    }
  }
}
