interface PostgresConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  pool_max: number;
}

export default PostgresConfig;
