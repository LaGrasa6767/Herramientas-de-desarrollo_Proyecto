package com.marketplace.service;

import com.marketplace.model.CartItem;
import com.marketplace.model.Product;
import com.marketplace.repository.CartItemRepository;
import com.marketplace.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    public List<CartItem> getCart() {
        return getCart(null);
    }

    public List<CartItem> getCart(Long userId) {
        List<CartItem> items = (userId != null) ? cartItemRepository.findByUserIdAndOrderIsNull(userId) : cartItemRepository.findByOrderIsNull();
        java.util.Map<Long, CartItem> uniqueByProduct = new java.util.LinkedHashMap<>();
        boolean cleaned = false;

        for (CartItem item : items) {
            if (item.getProduct() != null && item.getProduct().getId() != null) {
                Long pId = item.getProduct().getId();
                if (uniqueByProduct.containsKey(pId)) {
                    CartItem existing = uniqueByProduct.get(pId);
                    existing.setCantidad(existing.getCantidad() + item.getCantidad());
                    existing.setSubtotal(existing.getProduct().getPrecio().doubleValue() * existing.getCantidad());
                    cartItemRepository.save(existing);
                    cartItemRepository.deleteById(item.getId());
                    cleaned = true;
                } else {
                    uniqueByProduct.put(pId, item);
                }
            } else {
                uniqueByProduct.put(item.getId(), item);
            }
        }
        return cleaned ? ((userId != null) ? cartItemRepository.findByUserIdAndOrderIsNull(userId) : cartItemRepository.findByOrderIsNull()) : items;
    }

    public CartItem addProduct(Long productId, int cantidad) {
        return addProduct(productId, cantidad, null);
    }

    public CartItem addProduct(Long productId, int cantidad, Long userId) {
        if (cantidad <= 0) {
            throw new RuntimeException("Cantidad inválida");
        }

        Product product = productService.getById(productId);
        if (product == null) {
            throw new RuntimeException("Producto no encontrado");
        }

        // Buscar si ya existe un ítem con este producto en el carrito de este usuario
        List<CartItem> cartItems = getCart(userId);
        for (CartItem existingItem : cartItems) {
            if (existingItem.getProduct() != null && existingItem.getProduct().getId().equals(productId)) {
                int nuevaCantidad = existingItem.getCantidad() + cantidad;
                if (product.getStock() < nuevaCantidad) {
                    throw new RuntimeException("Stock insuficiente para agregar " + cantidad + " más (Total solicitado: " + nuevaCantidad + ", Stock: " + product.getStock() + ")");
                }
                existingItem.setCantidad(nuevaCantidad);
                existingItem.setSubtotal(product.getPrecio().doubleValue() * nuevaCantidad);
                existingItem.setFechaAgregado(LocalDateTime.now());
                return cartItemRepository.save(existingItem);
            }
        }

        if (product.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        double subtotal = product.getPrecio().doubleValue() * cantidad;
        CartItem item = new CartItem(product, cantidad, subtotal, LocalDateTime.now());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(item::setUser);
        }
        return cartItemRepository.save(item);
    }

    public CartItem updateQuantity(Long cartItemId, int nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            removeCartItem(cartItemId);
            return null;
        }

        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Ítem del carrito no encontrado"));
        Product product = item.getProduct();
        if (product != null && product.getStock() < nuevaCantidad) {
            throw new RuntimeException("Solo quedan " + product.getStock() + " unidades disponibles en stock.");
        }

        item.setCantidad(nuevaCantidad);
        if (product != null) {
            item.setSubtotal(product.getPrecio().doubleValue() * nuevaCantidad);
        }
        return cartItemRepository.save(item);
    }

    public double total() {
        return getCart().stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
    }

    public void removeCartItem(Long id) {
        if (cartItemRepository.existsById(id)) {
            cartItemRepository.deleteById(id);
        } else {
            throw new RuntimeException("El ítem del carrito no existe");
        }
    }

    public void clearCart() {
        clearCart(null);
    }

    public void clearCart(Long userId) {
        if (userId != null) {
            List<CartItem> items = cartItemRepository.findByUserIdAndOrderIsNull(userId);
            cartItemRepository.deleteAll(items);
        } else {
            List<CartItem> items = cartItemRepository.findByOrderIsNull();
            cartItemRepository.deleteAll(items);
        }
    }
}