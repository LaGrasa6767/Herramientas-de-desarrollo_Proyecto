import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {

  cart: any[] = [];
  total = 0;

  productId = 0;
  quantity = 1;

  constructor(private api: ApiService) {
    this.load();
    this.loadTotal();
  }

  load() {
    this.api.getCart().subscribe((data: any) => {
      this.cart = data;
    });
  }

  loadTotal() {
    this.api.getCartTotal().subscribe((data: any) => {
      this.total = data;
    });
  }

  add() {
    this.api.addToCart(this.productId, this.quantity).subscribe(() => {
      this.load();
      this.loadTotal();
      this.productId = 0;
      this.quantity = 1;
    });
  }

clear() {
  this.api.clearCart().subscribe({
    next: () => {
      this.load();
      this.loadTotal();
    },
    error: (err) => {
      console.error("Error al limpiar carrito", err);
    }
  });
}
  
}