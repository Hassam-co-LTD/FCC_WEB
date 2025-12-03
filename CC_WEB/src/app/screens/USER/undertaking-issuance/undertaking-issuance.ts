import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-undertaking-issuance',
  standalone: true,
  imports: [CommonModule, MatIcon, RouterLink, RouterLinkActive],
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss']
})
export class UndertakingIssuance { 
  
}
