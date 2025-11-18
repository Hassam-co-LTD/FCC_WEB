import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-undertaking-details',
  imports: [MatIcon],
  templateUrl: './undertaking-details.html',
  styleUrl: './undertaking-details.scss',
})
export class UndertakingDetails {
  isOpen = true;
  
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
