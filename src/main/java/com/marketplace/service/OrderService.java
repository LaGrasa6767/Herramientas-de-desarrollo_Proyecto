package com.marketplace.service;

import com.marketplace.model.CartItem;
import com.marketplace.model.Order;
import com.marketplace.repository.OrderRepository;
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

    public Order createOrderFromCart() {

        List<CartItem> cart = cartService.getCart();

        if (cart.isEmpty()) {
            throw new RuntimeException("Carrito vacío");
        }

        Order order = new Order();

        order.setStatus("CREATED");

        double total = cart.stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();

        order.setTotal(total);

        order.setFecha(LocalDateTime.now());

        for (CartItem item : cart) {
            item.setOrder(order);
        }

        order.setItems(cart);

        Order savedOrder = orderRepository.save(order);

        cartService.clearCart();

        return savedOrder;
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

        order.setStatus("CANCELLED");

        return orderRepository.save(order);
    }
}