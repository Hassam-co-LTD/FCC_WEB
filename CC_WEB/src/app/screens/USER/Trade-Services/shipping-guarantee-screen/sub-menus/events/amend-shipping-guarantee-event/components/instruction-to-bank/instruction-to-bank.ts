import { Component, Input } from '@angular/core';

import { FormGroup, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-instruction-to-bank',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule
],
  templateUrl: './instruction-to-bank.html',
  styleUrls: ['./instruction-to-bank.scss']
})
export class InstructionToBank {
  isOpen = true;
  @Input() form!: FormGroup;

  // Dropdown lists
  principalAccounts = ['Account 1', 'Account 2', 'Account 3'];

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
