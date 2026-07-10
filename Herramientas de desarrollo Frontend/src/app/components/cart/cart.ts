import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {

  cart: any[] = [];
  total = 0;

  // Lista de productos del catálogo para poder agregar rápidamente desde un selector
  productsList: any[] = [];
  productId: number = 0;
  quantity: number = 1;

  // Notificaciones flotantes
  mensaje = '';
  tipoMensaje = 'success'; // 'success' | 'error'

  // Imagen por defecto si el producto en el carrito no tiene una cargada
  defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
    this.loadProducts();
  }

  // Cargar ítems del carrito y calcular total
  load() {
    this.api.getCart().subscribe({
      next: (data: any) => {
        this.cart = data || [];
        this.loadTotal();
      },
      error: (err) => {
        console.error('Error al cargar carrito:', err);
        this.mostrarNotificacion('No se pudo cargar la lista del carrito desde el servidor.', 'error');
      }
    });
  }

  // Cargar el total en soles del carrito
  loadTotal() {
    this.api.getCartTotal().subscribe({
      next: (data: any) => {
        this.total = data || 0;
      },
      error: (err) => {
        console.error('Error al calcular total del carrito:', err);
      }
    });
  }

  // Cargar catálogo para el selector rápido de añadir al carrito
  loadProducts() {
    this.api.getProducts().subscribe({
      next: (data: any) => {
        // Solo mostrar productos con stock disponible para agregar desde carrito
        this.productsList = (data || []).filter((p: any) => p.stock > 0);
        if (this.productsList.length > 0 && this.productId === 0) {
          this.productId = this.productsList[0].id;
        }
      },
      error: (err) => {
        console.error('Error al cargar catálogo en carrito:', err);
      }
    });
  }

  // Agregar producto al carrito desde el selector o input
  add() {
    if (!this.productId || this.productId <= 0) {
      this.mostrarNotificacion('Por favor selecciona un producto válido para agregar.', 'error');
      return;
    }
    if (!this.quantity || this.quantity <= 0) {
      this.mostrarNotificacion('La cantidad debe ser al menos 1 unidad.', 'error');
      return;
    }

    this.api.addToCart(this.productId, this.quantity).subscribe({
      next: () => {
        const prod = this.productsList.find(p => p.id === Number(this.productId));
        const nombreProd = prod ? prod.nombre : `ID #${this.productId}`;
        this.mostrarNotificacion(`¡Se agregaron ${this.quantity} unidad(es) de "${nombreProd}" al carrito!`, 'success');
        this.quantity = 1;
        this.load();
        this.loadProducts(); // Actualizar el stock en el selector
      },
      error: (err: any) => {
        console.error('Error al agregar al carrito:', err);
        const msj = err.error && typeof err.error === 'string' ? err.error : 'Stock insuficiente o error en el servidor.';
        this.mostrarNotificacion(`No se pudo agregar al carrito: ${msj}`, 'error');
      }
    });
  }

  // Eliminar un ítem individual del carrito
  removeItem(item: any) {
    const nombre = item && item.product ? item.product.nombre : 'artículo';
    if (confirm(`¿Estás seguro de quitar "${nombre}" del carrito?`)) {
      this.api.removeCartItem(item.id).subscribe({
        next: () => {
          this.mostrarNotificacion(`Artículo "${nombre}" eliminado del carrito.`, 'success');
          this.load();
          this.loadProducts(); // Restaura el stock en el selector
        },
        error: (err: any) => {
          if (err.status === 200 || err.status === 204) {
            this.mostrarNotificacion(`Artículo "${nombre}" eliminado del carrito.`, 'success');
            this.load();
            this.loadProducts();
          } else {
            console.error('Error al quitar ítem:', err);
            this.mostrarNotificacion('No se pudo quitar el producto del carrito en el servidor.', 'error');
          }
        }
      });
    }
  }

  // Actualizar cantidad directa (+ y -) de un ítem en la tarjeta
  updateQuantity(item: any, newQty: number) {
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }
    this.api.updateCartItemQuantity(item.id, newQty).subscribe({
      next: () => {
        item.cantidad = newQty;
        if (item.product && item.product.precio) {
          item.subtotal = Number((item.product.precio * newQty).toFixed(2));
        }
        this.loadTotal();
        this.loadProducts();
      },
      error: (err: any) => {
        if (err.status === 200 || err.status === 204) {
          item.cantidad = newQty;
          if (item.product && item.product.precio) {
            item.subtotal = Number((item.product.precio * newQty).toFixed(2));
          }
          this.load();
          this.loadProducts();
        } else {
          console.error('Error al actualizar cantidad:', err);
          const msj = err.error && typeof err.error === 'string' ? err.error : (err.error && err.error.error ? err.error.error : 'Stock insuficiente disponible para aumentar la cantidad.');
          this.mostrarNotificacion(msj, 'error');
        }
      }
    });
  }

  // Vaciar toda la canasta de compras
  clear() {
    if (this.cart.length === 0) return;
    if (confirm('¿Estás seguro de vaciar toda tu canasta de compras?')) {
      this.api.clearCart().subscribe({
        next: () => {
          this.mostrarNotificacion('Tu carrito ha sido vaciado por completo.', 'success');
          this.load();
          this.loadProducts();
        },
        error: (err: any) => {
          if (err.status === 200 || err.status === 204) {
            this.mostrarNotificacion('Tu carrito ha sido vaciado por completo.', 'success');
            this.load();
            this.loadProducts();
          } else {
            console.error('Error al limpiar carrito:', err);
            this.mostrarNotificacion('Ocurrió un error al intentar limpiar el carrito.', 'error');
          }
        }
      });
    }
  }

  // Procesar Compra -> Genera la Orden en el Backend y redirige a Órdenes
  checkout() {
    if (this.cart.length === 0) {
      this.mostrarNotificacion('No puedes procesar la compra porque tu carrito está vacío.', 'error');
      return;
    }

    if (confirm(`¿Proceder con la compra de ${this.cart.length} artículo(s) por un total de S/ ${this.total}? Se generará tu orden de pedido.`)) {
      this.api.createOrder().subscribe({
        next: (res: any) => {
          const orderId = res && res.id ? res.id : '';
          this.mostrarNotificacion(`🎉 ¡Compra exitosa! Se generó la Orden #${orderId}. Redirigiéndote para el pago...`, 'success');
          // Redirigir a la pestaña de Órdenes tras 1.5 segundos para que vea y pague su orden
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 1600);
        },
        error: (err: any) => {
          console.error('Error al generar orden:', err);
          const msj = err.error && typeof err.error === 'string' ? err.error : 'No se pudo generar la orden en el servidor.';
          this.mostrarNotificacion(`Error en el checkout: ${msj}`, 'error');
        }
      });
    }
  }

  // Ayudante para mostrar notificaciones flotantes temporales
  mostrarNotificacion(texto: string, tipo: string = 'success') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4500);
  }

  // Obtener imagen segura para el ítem del carrito
  getItemImage(item: any): string {
    if (item && item.product && item.product.imagen && item.product.imagen.trim() !== '') {
      return item.product.imagen;
    }
    return this.defaultImage;
  }
}