import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthState } from '../../state/auth.state';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: 'dashboard', exact: true },
    { label: 'Projects', path: 'projects' },
    { label: 'Members', path: 'members' },
    { label: 'Settings', path: 'settings' },
  ];

  onLogout(): void {
    this.authState.logout();
    // this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
