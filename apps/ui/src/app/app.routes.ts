import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { MembersComponent } from './pages/members/members.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'projects', component: ProjectsComponent, data: { title: 'Projects' } },
      { path: 'members', component: MembersComponent, data: { title: 'Members' } },
      { path: 'settings', component: SettingsComponent, data: { title: 'Settings' } },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
