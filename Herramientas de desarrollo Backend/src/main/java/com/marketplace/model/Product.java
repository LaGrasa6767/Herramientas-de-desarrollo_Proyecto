package com.marketplace.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

   @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
    private String nombre;

    private BigDecimal precio;

    private int stock;

    @Column(columnDefinition = "TEXT")
    private String imagen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    public Product() {}

    public Product(Long id, String nombre, BigDecimal precio, int stock, String imagen, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.imagen = imagen;
        this.descripcion = descripcion;
    }

    public Long getId() {
        return id;
    }

    // 🔥 IMPORTANTE
    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}