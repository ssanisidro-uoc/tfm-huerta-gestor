import dotenv from 'dotenv';
import { BackendApp } from './BackendApp';
import { TaskRecurrenceCronjob } from './cronjobs/TaskRecurrenceCronjob';
dotenv.config();

try {
  TaskRecurrenceCronjob.start();

  const backendApp = new BackendApp();
  backendApp.start().catch(handleError);
} catch (e) {
  handleError(e);
}

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
  process.exit(1);
});

function handleError(e: any) {
  console.log(e);
  process.exit(1);
}
