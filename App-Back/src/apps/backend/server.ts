import bodyParser from 'body-parser';
import compress from 'compression';
import express, { Application } from 'express';
import Router from 'express-promise-router';
import helmet from 'helmet';
import * as http from 'http';
import cors from 'cors';
import { logger } from '../../Contexts/Shared/infrastructure/Logger';
import { registerRoutes } from './routes';
import { handle_errors } from './middleware/error.middleware';

export class Server {
  readonly port: string;
  private app: Application;
  httpServer?: http.Server;

  constructor(port: string) {
    this.port = port;
    this.app = express();
    this.app.use(cors({
      origin: ['http://localhost:4200', 'http://localhost:3001'],
      credentials: true
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(helmet.xssFilter());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.frameguard({ action: 'deny' }));
    this.app.use(compress());

    const router = Router();
    this.app.use(router);
    this.app.use(handle_errors);

    registerRoutes(router);
  }

  async listen(): Promise<void> {
    return new Promise(resolve => {
      this.httpServer = this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  getHTTPServer() {
    return this.httpServer;
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close(error => {
          if (error) {
            return reject(error);
          }
          return resolve();
        });
      }
      return resolve();
    });
  }
}
