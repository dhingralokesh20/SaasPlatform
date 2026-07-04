import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: 'dashboard', exact: true },
    { label: 'Projects', path: 'projects' },
    { label: 'Members', path: 'members' },
    { label: 'Settings', path: 'settings' },
  ];
}
