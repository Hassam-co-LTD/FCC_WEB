import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-undertaking-issued',
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule , RouterLink]
})
export class UndertakingIssuance {

  constructor() {}
}