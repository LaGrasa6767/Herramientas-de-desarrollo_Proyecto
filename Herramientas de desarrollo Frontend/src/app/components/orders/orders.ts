import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  ordersList: any[] = [];
  allOrdersList: any[] = [];
  groupedOrdersList: { user: any, userKey: string, displayName: string, orders: any[] }[] = [];
  uniqueUsers: any[] = [];
  selectedUserIdFilter: string = 'ALL';
  viewMode: 'GROUPED' | 'FLAT' = 'GROUPED';
  selectedOrder: any = null;
  searchId: number | null = null;
  loading = false;

  notificacion = {
    mostrar: false,
    mensaje: '',
    tipo: 'success'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.viewMode = this.isAdmin() ? 'GROUPED' : 'FLAT';
    this.loadOrders();
  }

  isAdmin(): boolean {
    const r = localStorage.getItem('role') || '';
    return r.toLowerCase().includes('admin');
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Usuario Anónimo / Sin Cuenta';
    if (user.nombre && user.nombre.trim() !== '') return user.nombre;
    if (user.email && user.email.trim() !== '') return user.email;
    if (user.id !== null && user.id !== undefined) return 'ID #' + user.id;
    return 'Usuario Anónimo / Sin Cuenta';
  }

  getGroupTotal(orders: any[]): string {
    const sum = (orders || []).reduce((acc, o) => acc + (o.total || 0), 0);
    return sum.toFixed(2);
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.notificacion = { mostrar: true, mensaje, tipo };
    setTimeout(() => {
      this.notificacion.mostrar = false;
    }, 4000);
  }

  loadOrders() {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (res: any[]) => {
        this.loading = false;
        // Ordenar del más reciente al más antiguo por ID
        this.allOrdersList = (res || []).sort((a, b) => b.id - a.id);
        
        // Extraer usuarios únicos que tienen órdenes para el selector del administrador
        const userMap = new Map<number, any>();
        this.allOrdersList.forEach(o => {
          if (o.user && o.user.id) {
            if (!userMap.has(o.user.id)) {
              userMap.set(o.user.id, { ...o.user, orderCount: 1 });
            } else {
              const u = userMap.get(o.user.id);
              u.orderCount = (u.orderCount || 0) + 1;
            }
          }
        });
        this.uniqueUsers = Array.from(userMap.values());

        this.filterByUser();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar órdenes:', err);
        this.mostrarNotificacion('Error al cargar el historial de órdenes desde el servidor.', 'error');
      }
    });
  }

  filterByUser() {
    if (this.selectedUserIdFilter === 'ALL' || !this.selectedUserIdFilter) {
      this.ordersList = [...this.allOrdersList];
    } else {
      this.ordersList = this.allOrdersList.filter(o => o.user && String(o.user.id) === String(this.selectedUserIdFilter));
    }
    
    // Agrupar órdenes separadas por usuario (Juan por un lado, los null/anónimos por otro)
    const groupsMap = new Map<string, { user: any, userKey: string, displayName: string, orders: any[] }>();
    
    this.ordersList.forEach(o => {
      const u = o.user;
      const key = (u && u.id !== null && u.id !== undefined) ? `user_${u.id}` : 'user_null';
      const name = this.getUserDisplayName(u);
      
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { user: u, userKey: key, displayName: name, orders: [] });
      }
      groupsMap.get(key)!.orders.push(o);
    });

    // Convertir a array. Ordenar para que los usuarios registrados aparezcan primero y 'Usuario Anónimo / Sin Cuenta' al final
    this.groupedOrdersList = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.userKey === 'user_null') return 1;
      if (b.userKey === 'user_null') return -1;
      return a.displayName.localeCompare(b.displayName);
    });

    // Si hay una orden seleccionada, actualizar o deseleccionar si ya no está en el filtro
    if (this.selectedOrder) {
      const updated = this.ordersList.find(o => o.id === this.selectedOrder.id);
      if (updated) {
        this.selectedOrder = updated;
      }
    }
  }

  toggleViewMode() {
    this.viewMode = (this.viewMode === 'GROUPED') ? 'FLAT' : 'GROUPED';
  }

  resetFilters() {
    this.selectedUserIdFilter = 'ALL';
    this.searchId = null;
    this.filterByUser();
    this.selectedOrder = null;
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  searchOrderById() {
    if (!this.searchId || this.searchId <= 0) {
      this.mostrarNotificacion('Por favor ingresa un número de ID válido para buscar.', 'error');
      return;
    }
    this.loading = true;
    this.api.getOrderById(this.searchId).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.selectedOrder = res;
        this.mostrarNotificacion(`Orden #${res.id} encontrada correctamente.`, 'success');
      },
      error: (err) => {
        this.loading = false;
        console.error('Error buscando orden:', err);
        this.mostrarNotificacion(`No se encontró ninguna orden con el ID #${this.searchId}.`, 'error');
      }
    });
  }

  payOrder(order: any, event?: Event) {
    if (event) event.stopPropagation();
    if (order.status === 'PAID') {
      this.mostrarNotificacion('Esta orden ya se encuentra pagada.', 'error');
      return;
    }
    if (confirm(`¿Estás seguro de procesar el pago en línea de la Orden #${order.id} por S/ ${order.total.toFixed(2)}?`)) {
      this.api.payOrder(order.id).subscribe({
        next: (res: any) => {
          this.mostrarNotificacion(`¡Pago confirmado exitosamente para la Orden #${order.id}!`, 'success');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Error al pagar orden:', err);
          this.mostrarNotificacion('No se pudo procesar el pago del pedido en este momento.', 'error');
        }
      });
    }
  }

  cancelOrder(order: any, event?: Event) {
    if (event) event.stopPropagation();
    if (order.status === 'CANCELLED') {
      this.mostrarNotificacion('Esta orden ya ha sido cancelada.', 'error');
      return;
    }
    if (confirm(`¿Estás seguro de cancelar la Orden #${order.id}? Esta acción cambiará el estado del pedido.`)) {
      this.api.cancelOrder(order.id).subscribe({
        next: (res: any) => {
          this.mostrarNotificacion(`Orden #${order.id} ha sido cancelada.`, 'success');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Error al cancelar orden:', err);
          this.mostrarNotificacion('No se pudo cancelar el pedido en el servidor.', 'error');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CREATED':
      case 'PENDING':
        return 'Pendiente de Pago';
      case 'PAID':
        return 'Pagada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status || 'Desconocido';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CREATED':
      case 'PENDING':
        return 'status-pending';
      case 'PAID':
        return 'status-paid';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  formatDate(fechaStr: string): string {
    if (!fechaStr) return 'Fecha no disponible';
    try {
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return fechaStr;
    }
  }
}