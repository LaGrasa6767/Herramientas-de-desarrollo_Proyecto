import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders {

  orderId = 0;
  order: any = null;

  constructor(private api: ApiService) {}

  createOrder() {
    this.api.createOrder().subscribe((res: any) => {
      this.order = res;
      this.orderId = res.id;
    });
  }

  payOrder() {
    this.api.payOrder(this.orderId).subscribe((res: any) => {
      this.order = res;
    });
  }

  cancelOrder() {
    this.api.cancelOrder(this.orderId).subscribe((res: any) => {
      this.order = res;
    });
  }

  searchOrder() {
    this.api.getOrderById(this.orderId).subscribe((res: any) => {
      this.order = res;
    });
  }
}