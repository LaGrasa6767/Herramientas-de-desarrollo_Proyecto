import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {

  products: any[] = [];
  filteredProducts: any[] = [];

  
  nombre = '';
  precio = 0;
  stock = 0;

  searchText = '';

  productId = 0;
  porcentaje = 0;

  mensaje = '';

  constructor(private api: ApiService) {
    this.load();
  }


  load() {
    this.api.getProducts().subscribe((data: any) => {
      this.products = data;
      this.filteredProducts = data;
    });
  }


  create() {
    const data = {
      nombre: this.nombre,
      precio: this.precio,
      stock: this.stock
    };

    this.api.createProduct(data).subscribe(() => {
      this.load();

      this.nombre = '';
      this.precio = 0;
      this.stock = 0;
    });
  }


  search() {
    this.filteredProducts = this.products.filter(p =>
      p.nombre.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }


  applyDiscount() {
    this.api.applyDiscount(this.productId, this.porcentaje).subscribe({
      next: () => {
        this.mensaje = "Descuento aplicado correctamente";

        this.load();

        this.productId = 0;
        this.porcentaje = 0;
      },
      error: () => {
        this.mensaje = "Error al aplicar descuento";
      }
    });
  }
}