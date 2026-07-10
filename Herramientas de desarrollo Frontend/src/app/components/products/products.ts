import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];

  // Estado de edición (null si es crear nuevo producto)
  editingId: number | null = null;

  // Datos del Formulario de Producto (Crear/Editar)
  nombre = '';
  precio: number | null = null;
  stock: number | null = null;
  imagen = '';
  descripcion = '';

  // Búsqueda por nombre
  searchText = '';

  // Datos para Descuento (Solo Admin)
  selectedDiscountProductId: number = 0;
  porcentaje: number = 0.10; // 10% por defecto

  // Mensajes de notificación
  mensaje = '';
  tipoMensaje = 'success'; // 'success' | 'error'

  // Modal de Detalle de Producto
  selectedProduct: any = null;
  quantityToAdd: number = 1;

  // Imagen por defecto si un producto no tiene imagen asignada
  defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  // Verifica si el usuario actual tiene rol de Administrador
  isAdmin(): boolean {
    const role = localStorage.getItem('role') || '';
    return role.toUpperCase().includes('ADMIN');
  }

  // Cargar todos los productos desde el Backend
  load() {
    this.api.getProducts().subscribe({
      next: (data: any) => {
        this.products = data || [];
        this.search(); // Aplica el filtro actual si existiera
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.mostrarNotificacion('Error al cargar la lista de productos', 'error');
      }
    });
  }

  // Filtrar productos por nombre en tiempo real
  search() {
    if (!this.searchText.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const query = this.searchText.toLowerCase().trim();
      this.filteredProducts = this.products.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(query)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query))
      );
    }
  }

  // Capturar imagen local (ej: desde Descargas), redimensionar/comprimir para evitar errores de tamaño en BD y convertir a Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.mostrarNotificacion('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500; // Máximo 500px de ancho/alto (ideal para tarjetas web y ultraligero para BD)
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * (maxDim / width));
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * (maxDim / height));
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Comprimir como JPEG calidad 0.78 (genera un string Base64 compacto de aprox. 30 KB que nunca da error en BD)
            this.imagen = canvas.toDataURL('image/jpeg', 0.78);
            this.mostrarNotificacion('🖼️ Imagen local optimizada y cargada con éxito para la base de datos.', 'success');
          } else {
            this.imagen = e.target.result;
            this.mostrarNotificacion('🖼️ Imagen cargada localmente.', 'success');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Cargar datos de un producto al formulario para EDITAR
  edit(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editingId = product.id;
    this.nombre = product.nombre;
    this.precio = product.precio;
    this.stock = product.stock;
    this.imagen = product.imagen || '';
    this.descripcion = product.descripcion || '';

    // Si estaba abierto en modal, lo cerramos o dejamos listo
    this.closeDetail();

    // Hacemos scroll suave hacia el formulario superior para editar cómodamente
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.mostrarNotificacion(`✏️ Editando los datos del producto: "${product.nombre}"`, 'success');
  }

  // Cancelar la edición y limpiar el formulario
  cancelEdit() {
    this.editingId = null;
    this.nombre = '';
    this.precio = null;
    this.stock = null;
    this.imagen = '';
    this.descripcion = '';
  }

  // Crear un nuevo producto (Admin)
  create() {
    if (!this.nombre.trim() || !this.precio || this.precio <= 0 || !this.stock || this.stock < 0) {
      this.mostrarNotificacion('Por favor completa los campos obligatorios: Nombre, Precio y Stock válido.', 'error');
      return;
    }

    const data = {
      nombre: this.nombre.trim(),
      precio: this.precio,
      stock: this.stock,
      imagen: this.imagen.trim() || this.defaultImage,
      descripcion: this.descripcion.trim() || 'Producto oficial del Marketplace UTP con garantía de calidad y disponibilidad inmediata.'
    };

    this.api.createProduct(data).subscribe({
      next: (res) => {
        this.mostrarNotificacion(`¡Producto "${this.nombre}" creado exitosamente en la base de datos!`, 'success');
        this.cancelEdit();
        this.load();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
        this.mostrarNotificacion('Error al crear el producto en el servidor.', 'error');
      }
    });
  }

  // Guardar cambios del producto que se está editando (Admin)
  update() {
    if (!this.editingId) return;
    if (!this.nombre.trim() || !this.precio || this.precio <= 0 || !this.stock || this.stock < 0) {
      this.mostrarNotificacion('Por favor completa los campos obligatorios: Nombre, Precio y Stock válido.', 'error');
      return;
    }

    const data = {
      nombre: this.nombre.trim(),
      precio: this.precio,
      stock: this.stock,
      imagen: this.imagen.trim() || this.defaultImage,
      descripcion: this.descripcion.trim() || 'Producto oficial del Marketplace UTP con garantía de calidad y disponibilidad inmediata.'
    };

    this.api.updateProduct(this.editingId, data).subscribe({
      next: (res) => {
        this.mostrarNotificacion(`💾 ¡Producto "${this.nombre}" actualizado correctamente en la base de datos!`, 'success');
        this.cancelEdit();
        this.load();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.mostrarNotificacion('Error al guardar los cambios del producto en el servidor.', 'error');
      }
    });
  }

  // Aplicar Descuento a un producto (Admin)
  applyDiscount() {
    if (!this.selectedDiscountProductId || this.selectedDiscountProductId <= 0) {
      this.mostrarNotificacion('Por favor selecciona un producto de la lista para aplicar el descuento.', 'error');
      return;
    }
    if (this.porcentaje <= 0 || this.porcentaje >= 1) {
      this.mostrarNotificacion('El porcentaje de descuento debe estar entre 0.01 (1%) y 0.99 (99%).', 'error');
      return;
    }

    this.api.applyDiscount(this.selectedDiscountProductId, this.porcentaje).subscribe({
      next: (res: any) => {
        const descPorcentaje = Math.round(this.porcentaje * 100);
        this.mostrarNotificacion(`¡Descuento del ${descPorcentaje}% aplicado al producto! Nuevo precio: S/ ${res.precio}`, 'success');
        this.load();
        this.selectedDiscountProductId = 0;
      },
      error: (err) => {
        console.error('Error al aplicar descuento:', err);
        this.mostrarNotificacion('Error al aplicar el descuento en el servidor.', 'error');
      }
    });
  }

  // Eliminar producto (Admin)
  delete(id: number, nombre: string, event: Event) {
    event.stopPropagation(); // Evita abrir el modal al hacer clic en eliminar
    if (confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.mostrarNotificacion(`Producto "${nombre}" eliminado.`, 'success');
          if (this.selectedProduct && this.selectedProduct.id === id) {
            this.closeDetail();
          }
          if (this.editingId === id) {
            this.cancelEdit();
          }
          this.load();
        },
        error: (err) => {
          console.error('Error eliminando producto:', err);
          this.mostrarNotificacion('No se pudo eliminar el producto.', 'error');
        }
      });
    }
  }

  // Abrir Modal de Detalle
  openDetail(product: any) {
    this.selectedProduct = { ...product };
    this.quantityToAdd = 1;
  }

  // Cerrar Modal de Detalle
  closeDetail() {
    this.selectedProduct = null;
  }

  // Agregar al Carrito desde el listado o desde el modal
  addToCart(product: any, quantity: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    if (product.stock <= 0) {
      this.mostrarNotificacion('Este producto está agotado por el momento.', 'error');
      return;
    }

    if (quantity > product.stock) {
      this.mostrarNotificacion(`Solo quedan ${product.stock} unidades disponibles en stock.`, 'error');
      return;
    }

    this.api.addToCart(product.id, quantity).subscribe({
      next: () => {
        this.mostrarNotificacion(`¡Se agregaron ${quantity} unidad(es) de "${product.nombre}" al carrito!`, 'success');
        product.stock -= quantity;
        if (this.selectedProduct && this.selectedProduct.id === product.id) {
          this.selectedProduct.stock -= quantity;
          if (this.selectedProduct.stock <= 0) {
            this.closeDetail();
          }
        }
        this.load();
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.mostrarNotificacion('Ocurrió un error al intentar agregar el producto al carrito.', 'error');
      }
    });
  }

  // Ayudante para mostrar notificaciones flotantes temporales
  mostrarNotificacion(texto: string, tipo: string = 'success') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4500);
  }

  // Obtener URL de imagen segura o por defecto
  getProductImage(product: any): string {
    if (product && product.imagen && product.imagen.trim() !== '') {
      return product.imagen;
    }
    return this.defaultImage;
  }

  // Resumen corto para la tarjeta con puntos suspensivos si es largo
  getResumenDescripcion(product: any): string {
    if (!product) return '';
    const desc = product.descripcion && product.descripcion.trim() !== ''
      ? product.descripcion
      : `Producto oficial del Marketplace UTP con garantía de calidad y disponibilidad para despacho inmediato.`;
    if (desc.length > 85) {
      return desc.slice(0, 85).trim() + '...';
    }
    return desc;
  }

  // Descripción completa para el modal al hacer clic en el producto
  getDescripcionCompleta(product: any): string {
    if (!product) return '';
    return product.descripcion && product.descripcion.trim() !== ''
      ? product.descripcion
      : `Producto oficial del Marketplace UTP con garantía de calidad y disponibilidad para despacho inmediato.`;
  }
}