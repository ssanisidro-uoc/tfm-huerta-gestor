import { Router } from 'express';
import { globSync } from 'glob';
import path from 'path';

type RouteRegister = (router: Router) => Promise<void>;

export async function registerRoutes(app: Router): Promise<void> {
  const routes_dir = path.join(__dirname, 'contexts');
  console.log('Loading routes from:', routes_dir);
  
  const route_files = globSync(path.join(routes_dir, '*.routes.*'));
  console.log('Found route files:', route_files);

  for (const route_file of route_files) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const module = require(route_file);
      
      const register_function = Object.values(module).find(
        (exported) => typeof exported === 'function' && exported.name.startsWith('register_')
      ) as RouteRegister | undefined;

      if (register_function) {
        await register_function(app);
        console.log(`✓ Rutas cargadas desde: ${path.basename(route_file)}`);
      }
    } catch (error) {
      console.error(`✗ Error cargando rutas desde ${route_file}:`, error);
    }
  }
}

export default registerRoutes;

