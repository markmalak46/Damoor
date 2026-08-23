import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface AdminMetric {
  label: string;
  value: string;
  note: string;
}

interface AdminOrder {
  id: string;
  customer: string;
  status: string;
  total: string;
}

interface AdminTask {
  title: string;
  detail: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  protected readonly metrics: AdminMetric[] = [
    { label: 'Revenue', value: 'EGP 42.8K', note: '+12% this week' },
    { label: 'Orders', value: '128', note: '18 awaiting review' },
    { label: 'Products', value: '112', note: '14 color edits live' },
    { label: 'Customers', value: '1.4K', note: '36 new accounts' },
  ];

  protected readonly orders: AdminOrder[] = [
    { id: '#DMR-1028', customer: 'Mariam Adel', status: 'Preparing', total: 'EGP 1,148' },
    { id: '#DMR-1027', customer: 'Omar Nabil', status: 'Confirmed', total: 'EGP 749' },
    { id: '#DMR-1026', customer: 'Nour Hassan', status: 'Delivered', total: 'EGP 1,497' },
  ];

  protected readonly tasks: AdminTask[] = [
    {
      title: 'Review low stock sizes',
      detail: 'Waffle Set olive and mint sizes need a quick stock check.',
    },
    {
      title: 'Prepare collection notes',
      detail: 'Add short editorial copy for the next Damoor shop update.',
    },
    {
      title: 'Check new customer messages',
      detail: 'Three support messages are waiting for a response.',
    },
  ];
}
