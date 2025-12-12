import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  clear() {
    throw new Error('Method not implemented.');
  }
  private formData = new BehaviorSubject<any>(null);
  currentData$ = this.formData.asObservable();

  setFormData(data: any) {
    this.formData.next(data);
  }

  getFormData() {
    return this.formData.value;
  }
}
