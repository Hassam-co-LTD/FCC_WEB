import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  userName = 'Hassam';
  lastUpdated = new Date();

  cards = [
    { title: 'Total Transactions', value: '₨ 1,254,000', icon: '💳', color: '#3B82F6' },
    { title: 'Pending Approvals', value: '12', icon: '🕒', color: '#F59E0B' },
    { title: 'Active LCs', value: '48', icon: '📄', color: '#10B981' },
    { title: 'Revenue (YTD)', value: '₨ 5.8M', icon: '📈', color: '#8B5CF6' },
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

    if (card.title.includes('Transactions')) {
      const rand = Math.floor(Math.random() * 1000);
      card.value = `₨ ${1_254_000 + rand}`;
    }
    if (card.title.includes('Pending')) {
      const rand = Math.floor(Math.random() * 5);
      card.value = `${12 + rand}`;
    }
    if (card.title.includes('Revenue')) {
      const rand = (Math.random() * 0.5).toFixed(1);
      card.value = `₨ ${5.8 + parseFloat(rand)}M`;
    }
  }

  updateNewsFeed() {
    // rotate news items to simulate live updates
    const firstNews = this.newsCards.shift();
    if (firstNews) {
      firstNews.time = new Date();
      this.newsCards.push(firstNews);
    }
  }
}