import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.route').then(
        (m) => m.AUTH_ROUTES,
      ),
  },
  {
    path: 'workspace',
    loadChildren: () =>
      import('./features/workspace/workspace.route').then(
        (m) => m.WORKSPACE_ROUTES,
      ),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];