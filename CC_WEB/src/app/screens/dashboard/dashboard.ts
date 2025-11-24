import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  userName = 'Hassam';
  cards = [
    { title: 'Total Transactions', value: '₨ 1,254,00', icon: '💳', color: '#3B82F6' },
    { title: 'Pending Approvals', value: '12', icon: '🕒', color: '#F59E0B' },
    { title: 'Active LCs', value: '48', icon: '📄', color: '#10B981' },
    { title: 'Revenue (YTD)', value: '₨ 5.8M', icon: '📈', color: '#8B5CF6' },
  ];

  getCardClass(index: number): string {
    return `card-${index}`;
  }
}