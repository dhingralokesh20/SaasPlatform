import { Component } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected readonly stats: StatCard[] = [
    { label: 'Total Projects', value: '12' },
    { label: 'Active Members', value: '8' },
    { label: 'Pending Tasks', value: '5' },
  ];
}
