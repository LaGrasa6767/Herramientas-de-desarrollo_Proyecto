package com.marketplace.controller;

import com.marketplace.model.Product;
import com.marketplace.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAll() {

        return ResponseEntity.ok(productService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product) {

        if (product.getNombre() == null ||
            product.getPrecio() == null ||
            product.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {

            return ResponseEntity.badRequest().body("Producto inválido");
        }

        Product saved = productService.save(product);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/discount")
    public ResponseEntity<?> applyDiscount(@PathVariable Long id,
                                           @RequestParam double porcentaje) {

        try {

            Product product = productService.applyDiscount(id, porcentaje);

            return ResponseEntity.ok(product);

        } catch (RuntimeException e) {

            if (e.getMessage() != null &&
                e.getMessage().toLowerCase().contains("no encontrado")) {

                return ResponseEntity.status(404).body(e.getMessage());
            }

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {

        try {

            productService.deleteById(id);

            return ResponseEntity.ok("Producto eliminado correctamente");

        } catch (RuntimeException e) {

            if (e.getMessage() != null &&
                e.getMessage().toLowerCase().contains("no encontrado")) {

                return ResponseEntity.status(404).body(e.getMessage());
            }

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}