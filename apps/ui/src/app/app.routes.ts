import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { MembersComponent } from './pages/members/members.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './guards/auth.guard';
import { authRedirectGuard } from './guards/auth-redirect-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authRedirectGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [authRedirectGuard] },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
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
