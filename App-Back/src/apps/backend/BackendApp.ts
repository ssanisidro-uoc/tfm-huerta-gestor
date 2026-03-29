import dotenv from 'dotenv';
import config from './config/config';
import { Server } from './server';

dotenv.config();

export class BackendApp {
  server?: Server;

  async start() {
    const port = config.get('app.port').toString();
    this.server = new Server(port);
    return this.server.listen();
  }

  get httpServer() {
    return this.server?.getHTTPServer();
  }

  async stop() {
    return this.server?.stop();
  }
}
