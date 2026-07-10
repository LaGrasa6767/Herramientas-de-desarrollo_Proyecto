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

  updateProduct(id: number, product: any) {
    return this.http.put(`${this.url}/products/${id}`, product);
  }
  applyDiscount(productId: number, porcentaje: number) {
    return this.http.post(`${this.url}/products/${productId}/discount`, null, {
      params: {
        porcentaje: porcentaje
      }
    });
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.url}/products/${id}`);
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
  private getAuthParams(): any {
    const params: any = {};
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (userId) params.userId = userId;
    if (role) params.role = role;
    return params;
  }

  // CARRITO
  getCart() {
    return this.http.get(`${this.url}/cart`, { params: this.getAuthParams() });
  }

  getCartTotal() {
    return this.http.get(`${this.url}/cart/total`, { params: this.getAuthParams() });
  }

  addToCart(productId: number, quantity: number) {
    const params = { productId, quantity, ...this.getAuthParams() };
    return this.http.post(`${this.url}/cart/add`, null, { params });
  }

  clearCart() {
    return this.http.delete(`${this.url}/cart/clear`, { params: this.getAuthParams() });
  }

  removeCartItem(id: number) {
    return this.http.delete(`${this.url}/cart/${id}`);
  }

  updateCartItemQuantity(id: number, quantity: number) {
    return this.http.put(`${this.url}/cart/${id}/quantity`, null, {
      params: { quantity }
    });
  }

  // ÓRDENES
  createOrder() {
    return this.http.post(`${this.url}/orders/create`, {}, { params: this.getAuthParams() });
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

  getOrders() {
    return this.http.get<any[]>(`${this.url}/orders`, { params: this.getAuthParams() });
  }
}