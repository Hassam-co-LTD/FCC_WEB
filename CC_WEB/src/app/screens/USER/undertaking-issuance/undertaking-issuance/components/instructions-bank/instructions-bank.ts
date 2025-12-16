import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators,  } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-instructions-bank',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatInputModule
],
  templateUrl: './instructions-bank.html',
  styleUrls: ['./instructions-bank.scss']
})
export class InstructionsBank {
  @Input() form!: FormGroup;
  @Output() formChange = new EventEmitter<FormGroup>();
  @Output() toggleCollapse = new EventEmitter<boolean>();

  isOpen = true;

  // Delivery Type options
  deliveryTypeOptions = [
    { value: 'original', label: 'Delivery of Original Undertaking' },
    { value: 'copy', label: 'Copy' }
  ];

  // Delivery Mode options
  deliveryModeOptions = [
    { value: 'courier', label: 'Courier' },
    { value: 'pickup', label: 'Pick Up' },
    { value: 'email', label: 'Email' },
    { value: 'swift', label: 'SWIFT' }
  ];

  // Delivery To options
  deliveryToOptions = [
    { value: 'ourselves', label: 'Ourselves' },
    { value: 'beneficiary', label: 'Beneficiary' },
    { value: 'representative', label: 'Representative' },
    { value: 'agent', label: 'Agent' },
    { value: 'other', label: 'Other' }
  ];

  // Account options (would typically come from API)
  accounts = [
    'Current Account - 1234567890',
    'Savings Account - 0987654321',
    'Corporate Account - 1122334455',
    'Trust Account - 5566778899'
  ];

  // Other instructions character limit
  readonly MAX_CHARS = 210;
instructionsForm: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Initialize form if not provided
    if (!this.form) {
      this.initializeForm();
    }
  }

  initializeForm() {
    this.form = this.fb.group({
      deliveryType: ['', Validators.required],
      deliveryMode: ['', Validators.required],
      deliveryTo: ['', Validators.required],
      principalAccount: ['', Validators.required],
      feeAccount: [''],
      otherInstructions: ['', [Validators.maxLength(this.MAX_CHARS)]]
    });

    this.emitFormChange();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleCollapse.emit(this.isOpen);
  }

  // Getter for character count
  get charCount(): number {
    return this.instructionsControl?.value?.length || 0;
  }

  // Getter for remaining characters
  get remainingChars(): number {
    return this.MAX_CHARS - this.charCount;
  }

  // Getter methods for form controls
  get deliveryTypeControl() {
    return this.form.get('deliveryType');
  }

  get deliveryModeControl() {
    return this.form.get('deliveryMode');
  }

  get deliveryToControl() {
    return this.form.get('deliveryTo');
  }

  get principalAccountControl() {
    return this.form.get('principalAccount');
  }

  get feeAccountControl() {
    return this.form.get('feeAccount');
  }

  get instructionsControl() {
    return this.form.get('otherInstructions');
  }

  // Format for preview display
  getDisplayValue(fieldName: string): string {
    const value = this.form.get(fieldName)?.value;
    
    if (!value) return '—';

    switch (fieldName) {
      case 'deliveryType':
        return this.deliveryTypeOptions.find(opt => opt.value === value)?.label || value;
      
      case 'deliveryMode':
        return this.deliveryModeOptions.find(opt => opt.value === value)?.label || value;
      
      case 'deliveryTo':
        return this.deliveryToOptions.find(opt => opt.value === value)?.label || value;
      
      case 'principalAccount':
      case 'feeAccount':
        return value;
      
      case 'otherInstructions':
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
      
      default:
        return String(value);
    }
  }

  // Get all instructions for preview
  getInstructionsPreview(): any {
    return {
      deliveryType: this.getDisplayValue('deliveryType'),
      deliveryMode: this.getDisplayValue('deliveryMode'),
      deliveryTo: this.getDisplayValue('deliveryTo'),
      principalAccount: this.getDisplayValue('principalAccount'),
      feeAccount: this.getDisplayValue('feeAccount'),
      otherInstructions: this.instructionsControl?.value || '—'
    };
  }

  // Reset form
  resetForm() {
    this.form.reset({
      deliveryType: '',
      deliveryMode: '',
      deliveryTo: '',
      principalAccount: '',
      feeAccount: '',
      otherInstructions: ''
    });
    this.emitFormChange();
  }

  // Validate form
  validateForm(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  // Get form values
  getFormValues() {
    return this.form.value;
  }

  private emitFormChange() {
    this.formChange.emit(this.form);
  }
}