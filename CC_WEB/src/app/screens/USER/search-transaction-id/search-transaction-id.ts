import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-search-transaction-id',
  standalone: true,
  imports: [CommonModule, MatIcon,],
  templateUrl: './search-transaction-id.html',
  styleUrl: './search-transaction-id.scss',
})
export class SearchTransactionID {

}
