import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { TopbarComponent } from "../topbar/topbar";
import { CommonModule } from '@angular/common';
import { MatMenuModule } from "@angular/material/menu";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  imports: [CommonModule, RouterOutlet, TopbarComponent, MatIconModule, RouterLinkWithHref, MatMenuModule],
})
export class LayoutComponent {
  collapsed = false;
  tradeMenuOpen = false;

  constructor(private router: Router) { }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  isCollapsed(): boolean {
    return this.collapsed;
  }

  toggleTradeMenu() {
    this.tradeMenuOpen = !this.tradeMenuOpen;
  }
}
