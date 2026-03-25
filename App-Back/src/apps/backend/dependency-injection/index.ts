import { ContainerBuilder, YamlFileLoader } from 'node-dependency-injection';
import path from 'path';
import config from '../config';

const env = config.get('env') || 'development';

const container = new ContainerBuilder();
const loader = new YamlFileLoader(container);

const loadPath = path.join(__dirname, `application_${env}.yaml`);

loader.load(loadPath);

export default container;
