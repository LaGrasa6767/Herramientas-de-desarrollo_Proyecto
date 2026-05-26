package com.marketplace.service;

import com.marketplace.model.CartItem;
import com.marketplace.model.Product;
import com.marketplace.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductService productService;

    public List<CartItem> getCart() {
        return cartItemRepository.findAll();
    }

    public CartItem addProduct(Long productId, int cantidad) {

        if (cantidad <= 0) {
            throw new RuntimeException("Cantidad inválida");
        }

        Product product = productService.getById(productId);

        if (product == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        if (product.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        double subtotal = product.getPrecio().doubleValue() * cantidad;

        CartItem item = new CartItem(
                product,
                cantidad,
                subtotal,
                LocalDateTime.now()
        );

        return cartItemRepository.save(item);
    }

    public double total() {
        return getCart().stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
    }

    public void clearCart() {
        cartItemRepository.deleteAll();
    }
}