import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES,
      ),
  },
  {
    path: 'auth/login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'auth/register',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/pages/users.component').then(
        (m) => m.UserComponent,
      ),
  },
  {
    path: 'gardens',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/gardens/pages/list/garden-list.component').then(
            (m) => m.GardenListComponent,
          ),
      },
      {
        path: 'shared',
        loadComponent: () =>
          import('./features/gardens/pages/shared-gardens/shared-gardens.component').then(
            (m) => m.SharedGardensComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/gardens/pages/create/garden-create.component').then(
            (m) => m.GardenCreateComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/gardens/pages/detail/garden-detail.component').then(
            (m) => m.GardenDetailComponent,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/gardens/pages/edit/garden-edit.component').then(
            (m) => m.GardenEditComponent,
          ),
      },
    ],
  },
  {
    path: 'gardens/:gardenId/plots/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/plots/pages/create/plot-create.component').then(
        (m) => m.PlotCreateComponent,
      ),
  },
  {
    path: 'plots/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/plots/pages/detail/plot-detail.component').then(
        (m) => m.PlotDetailComponent,
      ),
  },
  {
    path: 'plots/:id/rotations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/plots/pages/rotation-history/rotation-history.component').then(
        (m) => m.RotationHistoryComponent,
      ),
  },
  {
    path: 'crops',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/crops/pages/list/crop-list.component').then(
            (m) => m.CropListComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/crops/pages/detail/crop-detail.component').then(
            (m) => m.CropDetailComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'crops',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/crops/pages/admin-list/admin-list.component').then(
                (m) => m.CropAdminListComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/crops/pages/admin-form/admin-form.component').then(
                (m) => m.CropAdminFormComponent,
              ),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./features/crops/pages/admin-form/admin-form.component').then(
                (m) => m.CropAdminFormComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'plantings',
    canActivate: [authGuard],
    children: [
      {
        path: 'create',
        loadComponent: () =>
          import('./features/plantings/pages/create/planting-create.component').then(
            (m) => m.PlantingCreateComponent,
          ),
      },
      {
        path: 'create/:gardenId',
        loadComponent: () =>
          import('./features/plantings/pages/create/planting-create.component').then(
            (m) => m.PlantingCreateComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/plantings/pages/detail/planting-detail.component').then(
            (m) => m.PlantingDetailComponent,
          ),
      },
      {
        path: ':id/tasks',
        loadComponent: () =>
          import('./features/tasks/pages/history/task-history.component').then(
            (m) => m.TaskHistoryComponent,
          ),
      },
    ],
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/calendar/pages/calendar/calendar.component').then(
        (m) => m.CalendarComponent,
      ),
  },
  {
    path: 'tareas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tasks/pages/list/tasks-list.component').then(
            (m) => m.TasksListComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/tasks/pages/create/task-create.component').then(
            (m) => m.TaskCreateComponent,
          ),
      },
    ],
  },
  {
    path: 'meteorologia',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/weather/pages/weather/weather.component').then(
        (m) => m.WeatherComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];