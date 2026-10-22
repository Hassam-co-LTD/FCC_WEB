
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
      // store the rejected/previous value
      if (!this.areValuesEqual(currentValue, rejectedValue)) {
        previousValues[field] = rejectedValue;
      }
    });

    return previousValues;
  }

  // =====================================================
  // COMPARE DYNAMIC FIELDS
  // =====================================================

  compareDynamicFields(
    currentFields: any,
    rejectedFields: any,
  ): Record<string, any> {

    const previousValues: Record<string, any> = {};

    const current = this.normalizeDynamicFields(currentFields);
    const rejected = this.normalizeDynamicFields(rejectedFields);

    if (!current.length || !rejected.length) {
      return previousValues;
    }

    current.forEach((currentField) => {

      const fieldId = currentField?.fieldId;

      if (fieldId == null || fieldId === '') {
        return;
      }

      // Loose id match: ids may arrive as number in one payload
      // and string in the other
      const rejectedField = rejected.find(
        (field) => String(field?.fieldId) === String(fieldId),
      );

      if (!rejectedField) {
        return;
      }

      const currentValue = this.getDynamicValue(currentField);
      const rejectedValue = this.getDynamicValue(rejectedField);

      // Only store the rejected value when
      // the current value is different
      if (!this.areValuesEqual(currentValue, rejectedValue)) {
        previousValues[String(fieldId)] = rejectedValue;
      }
    });

    return previousValues;
  }

  // Accepts an array, a JSON string, or an object keyed by fieldId
  private normalizeDynamicFields(fields: any): any[] {
    if (!fields) {
      return [];
    }

    if (typeof fields === 'string') {
      try {
        return this.normalizeDynamicFields(JSON.parse(fields));
      } catch {
        return [];
      }
    }

    if (Array.isArray(fields)) {
      return fields;
    }

    if (typeof fields === 'object') {
      return Object.keys(fields).map((key) => ({
        fieldId: key,
        value: fields[key],
      }));
    }

    return [];
  }

  private getDynamicValue(field: any): any {
    return field?.value ?? field?.fieldValue ?? field?.enteredValue ?? '';
  }

  // =====================================================
  // CHECK WHETHER TWO VALUES ARE EQUAL
  // =====================================================

  private areValuesEqual(value1: any, value2: any): boolean {

    // Convert null / undefined to empty string
    const firstValue =
      value1 == null ? '' : String(value1).trim();

    const secondValue =
      value2 == null ? '' : String(value2).trim();

    return firstValue === secondValue;
  }
}

