import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // LOGIN
  login(data: any) {
    return this.http.post(this.url + '/auth/login', data);
  }

  // PRODUCTOS
  getProducts() {
    return this.http.get(this.url + '/products');
  }

  createProduct(product: any) {
    return this.http.post(this.url + '/products', product);
  }
  applyDiscount(productId: number, porcentaje: number) {
  return this.http.post(`${this.url}/products/${productId}/discount`, null, {
    params: {
      porcentaje: porcentaje
    }
  });
}

  // USUARIOS
getUsers() {
  return this.http.get(`${this.url}/users`);
}

createUser(data: any) {
  return this.http.post(`${this.url}/users`, data);
}

deleteUser(id: number) {
  return this.http.delete(`${this.url}/users/${id}`);
}
  // CARRITO
getCart() {
  return this.http.get(`${this.url}/cart`);
}

getCartTotal() {
  return this.http.get(`${this.url}/cart/total`);
}

addToCart(productId: number, quantity: number) {
  return this.http.post(`${this.url}/cart/add`, null, {
    params: { productId, quantity }
  });
}

clearCart() {
  return this.http.delete(`${this.url}/cart/clear`);
}
  // ÓRDENES
createOrder() {
  return this.http.post(`${this.url}/orders/create`, {});
}

payOrder(id: number) {
  return this.http.post(`${this.url}/orders/${id}/pay`, {});
}

cancelOrder(id: number) {
  return this.http.post(`${this.url}/orders/${id}/cancel`, {});
}

getOrderById(id: number) {
  return this.http.get(`${this.url}/orders/${id}`);
}
}