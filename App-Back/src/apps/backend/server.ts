import bodyParser from 'body-parser';
import compress from 'compression';
import errorHandler from 'errorhandler';
import express, { Application } from 'express';
import Router from 'express-promise-router';
import helmet from 'helmet';
import * as http from 'http';
import cors from 'cors';
import { logger } from '../../Contexts/Shared/infrastructure/Logger';
import { registerRoutes } from './routes';

export class Server {
  readonly port: string;
  private app: Application;
  httpServer?: http.Server;

  constructor(port: string) {
    this.port = port;
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(helmet.xssFilter());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.frameguard({ action: 'deny' }));
    this.app.use(compress());

    const router = Router();
    router.use(cors());
    router.use(errorHandler());
    this.app.use(router);

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
