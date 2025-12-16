import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../../../../core/services/admin-service/customer-form-service/customer-service';

@Component({
  selector: 'app-show-customer-data',
  imports: [],
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
