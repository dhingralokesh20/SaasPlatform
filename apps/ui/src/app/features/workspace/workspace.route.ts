import { Routes } from '@angular/router';
import { DashboardLayout } from '../../layouts/dashboard-layout/dashboard-layout';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/projects/projects').then((m) => m.Projects),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./pages/members/members').then((m) => m.Members),
      },
    ],
  },
];