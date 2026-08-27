import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TransactionComparisonService {
  // =====================================================
  // COMPARE NORMAL CUSTOMER FIELDS
  // =====================================================

  compare(
    currentData: any,
    rejectedData: any,
    fields: string[],
  ): Record<string, any> {
    const previousValues: Record<string, any> = {};

    if (!currentData || !rejectedData) {
      return previousValues;
    }

    fields.forEach((field) => {
      const currentValue = currentData[field];
      const rejectedValue = rejectedData[field];

      // If values are different,
      // store the rejected value
      if (!this.areValuesEqual(currentValue, rejectedValue)) {
        previousValues[field] = rejectedValue;
      }
    });

    return previousValues;
  }

  // =====================================================
  // COMPARE CUSTOMER DYNAMIC FIELDS
  // =====================================================

  compareDynamicFields(
    currentFields: any[],
    rejectedFields: any[],
  ): Record<string, any> {
    const previousValues: Record<string, any> = {};

    if (!currentFields || !rejectedFields) {
      return previousValues;
    }

    currentFields.forEach((currentField) => {
      const rejectedField = rejectedFields.find(
        (field) => field.fieldId === currentField.fieldId,
      );

      if (!rejectedField) {
        return;
      }

      if (!this.areValuesEqual(currentField.value, rejectedField.value)) {
        previousValues[currentField.fieldId] = rejectedField.value;
      }
    });

    return previousValues;
  }

  // =====================================================
  // CHECK WHETHER TWO VALUES ARE EQUAL
  // =====================================================

  private areValuesEqual(value1: any, value2: any): boolean {
    // Convert null / undefined to empty string
    const firstValue = value1 == null ? '' : String(value1).trim();

    const secondValue = value2 == null ? '' : String(value2).trim();

    return firstValue === secondValue;
  }
}
