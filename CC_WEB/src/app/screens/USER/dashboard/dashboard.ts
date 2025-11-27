import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatIcon],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  userName = 'LoveKumar';
  lastUpdated = new Date();

  // Stats Cards with trends
  cards = [
    { 
      title: 'Total Transactions', 
      value: '₨ 1,254,000', 
      icon: '💳', 
      color: '#3B82F6',
      trend: [{ name: 'Transactions', series: [{ name: new Date(), value: 1254000 }] }]
    },
    { 
      title: 'Pending Approvals', 
      value: '12', 
      icon: '🕒', 
      color: '#F59E0B',
      trend: [{ name: 'Pending', series: [{ name: new Date(), value: 12 }] }]
    },
    { 
      title: 'Active LCs', 
      value: '48', 
      icon: '📄', 
      color: '#10B981',
      trend: [{ name: 'Active LCs', series: [{ name: new Date(), value: 48 }] }]
    },
    { 
      title: 'Revenue (YTD)', 
      value: '₨ 5.8M', 
      icon: '📈', 
      color: '#8B5CF6',
      trend: [{ name: 'Revenue', series: [{ name: new Date(), value: 5800000 }] }]
    },
  ];

  newsCards = [
    { title: 'Market Update', snippet: 'Stocks are up by 2% today due to strong tech performance.', time: new Date() },
    { title: 'FX Rates', snippet: 'USD/PKR exchange rate is stable around 280.', time: new Date() },
    { title: 'Banking News', snippet: 'New fintech regulations coming next quarter.', time: new Date() },
  ];

  ngOnInit() {
    setInterval(() => {
      this.lastUpdated = new Date();
      this.updateRandomCard();
      this.updateNewsFeed();
    }, 5000);
  }

  updateRandomCard() {
    const idx = Math.floor(Math.random() * this.cards.length);
    const card = this.cards[idx];

    const now = new Date();

    if (card.title.includes('Transactions')) {
      const rand = Math.floor(Math.random() * 1000);
      card.value = `₨ ${1_254_000 + rand}`;
      card.trend[0].series.push({ name: now, value: 1_254_000 + rand });
    }

    if (card.title.includes('Pending')) {
      const rand = Math.floor(Math.random() * 5);
      card.value = `${12 + rand}`;
      card.trend[0].series.push({ name: now, value: 12 + rand });
    }

    if (card.title.includes('Revenue')) {
      const rand = (Math.random() * 0.5).toFixed(1);
      const val = 5.8 + parseFloat(rand);
      card.value = `₨ ${val}M`;
      card.trend[0].series.push({ name: now, value: val * 1_000_000 });
    }

    // Keep only last 10 points for smooth chart animation
    card.trend[0].series = card.trend[0].series.slice(-10);
  }

  updateNewsFeed() {
    const firstNews = this.newsCards.shift();
    if (firstNews) {
      firstNews.time = new Date();
      this.newsCards.push(firstNews);
    }
  }
}
