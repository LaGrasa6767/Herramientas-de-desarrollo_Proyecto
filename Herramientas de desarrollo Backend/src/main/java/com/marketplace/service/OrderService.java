package com.marketplace.service;

import com.marketplace.model.CartItem;
import com.marketplace.model.Order;
import com.marketplace.model.Product;
import com.marketplace.repository.OrderRepository;
import com.marketplace.repository.ProductRepository;
import com.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order createOrderFromCart() {
        return createOrderFromCart(null);
    }

    public Order createOrderFromCart(Long userId) {

        List<CartItem> cart = cartService.getCart(userId);

        if (cart.isEmpty()) {
            throw new RuntimeException("Carrito vacío");
        }

        Order order = new Order();

        if (userId != null) {
            userRepository.findById(userId).ifPresent(order::setUser);
        }

        order.setStatus("CREATED");

        double total = cart.stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();

        order.setTotal(total);

        order.setFecha(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        for (CartItem item : cart) {
            item.setOrder(savedOrder);
            if (item.getProduct() != null) {
                Product p = item.getProduct();
                int currentStock = p.getStock();
                int newStock = Math.max(0, currentStock - item.getCantidad());
                p.setStock(newStock);
                productRepository.save(p);
            }
        }

        savedOrder.setItems(cart);
        savedOrder = orderRepository.save(savedOrder);

        cartService.clearCart(userId);

        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return getAllOrders(null, null);
    }

    public List<Order> getAllOrders(Long userId, String role) {
        if (role != null && (role.equalsIgnoreCase("admin") || role.equalsIgnoreCase("administrador") || role.toLowerCase().contains("admin"))) {
            return orderRepository.findAll();
        }
        if (userId != null) {
            return orderRepository.findByUserId(userId);
        }
        return orderRepository.findAll();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElse(null);
    }

    public Order payOrder(Long id) {

        Order order = findById(id);

        if (order == null) {
            throw new RuntimeException("Orden no encontrada");
        }

        order.setStatus("PAID");

        return orderRepository.save(order);
    }

    public Order cancelOrder(Long id) {

        Order order = findById(id);

        if (order == null) {
            throw new RuntimeException("Orden no encontrada");
        }

        if ("CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException("Orden ya se encuentra cancelada");
        }

        order.setStatus("CANCELLED");

        if (order.getItems() != null) {
            for (CartItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product p = item.getProduct();
                    int currentStock = p.getStock();
                    p.setStock(currentStock + item.getCantidad());
                    productRepository.save(p);
                }
            }
        }

        return orderRepository.save(order);
    }
}