import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-undertaking-issued',
  templateUrl: './undertaking-issuance.html',
  styleUrls: ['./undertaking-issuance.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, RouterLink],
})
export class UndertakingIssuance {
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.loadDynamicFields();
  }
  //................ Dynamic fields...................

  storeDynamicFieldsResponse: any[] = [];
  fields: any[] = [];
  dynamicFieldsForm!: FormGroup;
  isDynamicFieldsOpen = true;

  private loadDynamicFields(): void {
    console.log(
      'Loading dynamic fields for ExportCollection screen with status A...',
    );
    this.api.getFieldsByScreenAndStatus('exportCollection', 'A').subscribe({
      next: (res: any) => {
        console.log('Field definitions:', res);

        this.fields = res;
        console.log('Dynamic fields loaded:', this.fields);
        const group: any = {};

        this.fields.forEach((field: any) => {
          group[field.fieldName] = [''];
        });

        this.dynamicFieldsForm = this.fb.group(group);

        // patch values if customer already loaded
        this.patchDynamicValues();
      },

      error: (err: any) => console.error('Error loading dynamic fields:', err),
    });
  }
  // ---------------- PATCH DYNAMIC VALUES ----------------
  private patchDynamicValues(): void {
    if (
      !this.dynamicFieldsForm ||
      !this.fields?.length ||
      !this.storeDynamicFieldsResponse?.length
    )
      return;

    const patchObj: any = {};

    this.storeDynamicFieldsResponse.forEach((savedField: any) => {
      const fieldDefinition = this.fields.find(
        (f: any) => f.fieldId == savedField.fieldId,
      );

      if (fieldDefinition) {
        patchObj[fieldDefinition.fieldName] = savedField.value || '';
      }
    });

    console.log('Dynamic patch object:', patchObj);

    this.dynamicFieldsForm.patchValue(patchObj);
  }
}
