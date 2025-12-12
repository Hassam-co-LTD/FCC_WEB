import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms'; 
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [
    ReactiveFormsModule, // ADD THIS
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './bank-details.html',
  styleUrls: ['./bank-details.scss']
})
export class BankDetails {
  @Input() form!: FormGroup;
  isOpen = true;
  selectedTab = 'issuing';

  ngOnInit() {
    // Initialize selectedTab from form value if it exists
    const savedTab = this.form.get('selectedTab')?.value;
    if (savedTab) {
      this.selectedTab = savedTab;
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
    // Update the form value
    this.form.get('selectedTab')?.setValue(tab);
  }
}