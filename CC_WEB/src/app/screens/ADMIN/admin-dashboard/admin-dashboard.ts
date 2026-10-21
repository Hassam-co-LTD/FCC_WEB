import { Component, inject } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
interface RecentChange {
  entity: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Approved' | 'Submitted';
  user: string;
  time: string;
}

interface ActivityItem {
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  category: string;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text?: string;
  type?: 'text' | 'entity' | 'list' | 'activity';
  entityData?: { name: string; type: string; status: string; date: string };
  listData?: { title: string; items: string[] };
  activityData?: { action: string; time: string }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    NgIf,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminComponent {
  private router = inject(Router);

  constructor(
    private auth: AuthService,
    private api: ApiService,
  ) {}
  // --- Summary Metrics ---
  metrics = [
    {
      label: 'Customers',
      count: '1,245',
      icon: 'people',
      route: '/admin/master-data/customers',
    },
    {
      label: 'Companies',
      count: '86',
      icon: 'business',
      route: '/admin/access-management/company',
    },
    {
      label: 'Client Users',
      count: '342',
      icon: 'person_outline',
      route: '/admin/access-management/client-user',
    },
    {
      label: 'Branches',
      count: '24',
      icon: 'account_balance',
      route: '/admin/master-data/branch',
    },
  ];

  // --- Overview Items ---
  overviewStats = [
    { label: 'Customers', count: 1245, icon: 'people' },
    { label: 'Companies', count: 86, icon: 'business' },
    { label: 'Client Users', count: 342, icon: 'person_outline' },
    { label: 'Branches', count: 24, icon: 'account_balance' },
    { label: 'Cities', count: 18, icon: 'location_city' },
    { label: 'Account Types', count: 12, icon: 'badge' },
    { label: 'Roles', count: 8, icon: 'admin_panel_settings' },
    { label: 'Permission Groups', count: 6, icon: 'folder_shared' },
    { label: 'Dynamic Fields', count: 45, icon: 'dynamic_form' },
  ];

  // --- Activity Feed ---
  recentActivities: ActivityItem[] = [
    {
      title: 'Customer Created',
      subtitle: 'ABC Trading Company',
      time: '5 min ago',
      icon: 'add_circle',
      category: 'Customer',
    },
    {
      title: 'Client User Created',
      subtitle: 'john.doe',
      time: '12 min ago',
      icon: 'person_add',
      category: 'User',
    },
    {
      title: 'Role Updated',
      subtitle: 'Administrator',
      time: '20 min ago',
      icon: 'edit',
      category: 'Access',
    },
    {
      title: 'Permission Group Created',
      subtitle: 'Trade Services Group',
      time: '32 min ago',
      icon: 'group_add',
      category: 'Access',
    },
    {
      title: 'Branch Updated',
      subtitle: 'Karachi Main Branch',
      time: '45 min ago',
      icon: 'store',
      category: 'Master Data',
    },
    {
      title: 'Dynamic Field Created',
      subtitle: 'Beneficiary Name',
      time: '1 hour ago',
      icon: 'post_add',
      category: 'Dynamic Fields',
    },
  ];

  // --- Recent Changes Table ---
  displayedColumns: string[] = ['entity', 'action', 'user', 'time'];
  recentChanges: RecentChange[] = [
    { entity: 'Customer', action: 'Created', user: 'admin', time: '5 min ago' },
    {
      entity: 'Role',
      action: 'Updated',
      user: 'administrator',
      time: '15 min ago',
    },
    {
      entity: 'Client User',
      action: 'Created',
      user: 'admin',
      time: '25 min ago',
    },
    { entity: 'Branch', action: 'Updated', user: 'admin', time: '40 min ago' },
    {
      entity: 'Dynamic Field',
      action: 'Created',
      user: 'admin',
      time: '1 hour ago',
    },
  ];

  // --- Quick Shortcuts ---
  quickActions = [
    {
      label: 'Create Customer',
      route: '/admin/master-data/customers',
      icon: 'person_add',
    },
    {
      label: 'Create Client User',
      route: '/admin/access-management/client-user',
      icon: 'group_add',
    },
    {
      label: 'Create Company',
      route: '/admin/access-management/company',
      icon: 'domain_add',
    },
    {
      label: 'Create Branch',
      route: '/admin/master-data/branch',
      icon: 'add_business',
    },
    {
      label: 'Create Role',
      route: '/admin/access-management/role-master',
      icon: 'security',
    },
    {
      label: 'Create Dynamic Field',
      route: '/admin/dynamic-fields/create-new',
      icon: 'playlist_add',
    },
  ];

  // --- AI Assistant Floating State ---

  isChatOpen = false;
  chatInput = '';

  chatMessages: ChatMessage[] = [
    {
      sender: 'assistant',
      type: 'text',
      text: 'Hello 👋\nHow can I help with the Admin Portal?',
    },
  ];

  suggestedQuestions = [
    'Customer status',
    'Recent activities',
    'Find a user',
    'Show available roles',
  ];

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  askQuestion(q: string): void {
    this.chatInput = q;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.chatInput.trim()) return;

    const loginId = this.auth.getLoginId();

    if (!loginId) {
      console.error('Login ID not found.');
      return;
    }

    const query = this.chatInput.trim();

    const payload = {
      loginId: loginId,
      message: query,
    };

    // Show user's question
    this.chatMessages.push({
      sender: 'user',
      type: 'text',
      text: query,
    });

    this.chatInput = '';

    // Send question to Spring AI
    this.api.sendMessage(payload).subscribe({
      next: (response: string) => {
        console.log('Spring AI response:', response);

        // Show actual API response
        this.chatMessages.push({
          sender: 'assistant',
          type: 'text',
          text: response,
        });
      },

      error: (error) => {
        console.error('Chatbot error:', error);

        this.chatMessages.push({
          sender: 'assistant',
          type: 'text',
          text: 'Sorry, I was unable to process your request.',
        });
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
