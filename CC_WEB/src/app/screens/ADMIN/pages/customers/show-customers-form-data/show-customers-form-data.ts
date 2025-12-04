import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../customer-service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-show-customer-data',
  imports:[CommonModule],
  templateUrl: './show-customers-form-data.html',
  styleUrls: ['./show-customers-form-data.scss']
})
export class ShowCustomersFormData implements OnInit {
  customerData: any;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.customerData$.subscribe(data => {
      this.customerData = data;
    });
  }

  
}
