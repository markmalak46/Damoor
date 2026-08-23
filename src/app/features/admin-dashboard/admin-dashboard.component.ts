import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface AdminNavLink {
  label: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  protected readonly navLinks: AdminNavLink[] = [
    {
      label: 'Orders',
      route: '/admin/orders',
      description: 'Review and filter customer orders.',
    },
  ];
}
