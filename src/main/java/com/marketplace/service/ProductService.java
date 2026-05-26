package com.marketplace.service;

import com.marketplace.model.Product;
import com.marketplace.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public Product applyDiscount(Long id, double discount) {

        Product product = getById(id);

        if (product == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        if (discount < 0 || discount > 1) {
            throw new RuntimeException("Descuento inválido");
        }

        BigDecimal porcentaje = BigDecimal.valueOf(discount);
        BigDecimal descuento = product.getPrecio().multiply(porcentaje);
        BigDecimal nuevoPrecio = product.getPrecio().subtract(descuento);

        product.setPrecio(nuevoPrecio);

        return productRepository.save(product);
    }

    public void deleteById(Long id) {

        Product p = getById(id);

        if (p == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        productRepository.deleteById(id);
    }
}