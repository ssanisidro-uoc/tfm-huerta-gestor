import convict from 'convict';
import path from 'path';

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test', 'dev'],
    default: 'development',
    env: 'NODE_ENV'
  },
  app: {
    port: {
      doc: 'The server port',
      format: Number,
      env: 'PORT',
      default: 3000
    }
  },
  database: {
    host: {
      doc: 'The database host',
      format: String,
      env: 'DB_HOST',
      default: 'localhost'
    },
    port: {
      doc: 'The database port',
      format: Number,
      env: 'DB_PORT',
      default: 5432
    },
    username: {
      doc: 'The database username',
      format: String,
      env: 'DB_USER',
      default: 'postgres'
    },
    password: {
      doc: 'The database password',
      format: String,
      env: 'DB_PASSWORD',
      default: 'postgres'
    },
    database: {
      doc: 'The database name',
      format: String,
      env: 'DB_NAME',
      default: 'huerta'
    }
  },
  jwt: {
    secret: {
      doc: 'The JWT secret key',
      format: String,
      env: 'JWT_SECRET',
      default: 'your-secret-key-change-in-production'
    },
    expiresIn: {
      doc: 'JWT token expiration time',
      format: String,
      env: 'JWT_EXPIRES_IN',
      default: '24h'
    },
    issuer: {
      doc: 'JWT token issuer',
      format: String,
      env: 'JWT_ISSUER',
      default: 'huerta-gestor'
    }
  }
});

const configDir = path.join(__dirname, 'config');
config.loadFile([`${configDir}/default.json`, `${configDir}/${config.get('env')}.json`]);

config.validate({ allowed: 'strict' });

export default config;
