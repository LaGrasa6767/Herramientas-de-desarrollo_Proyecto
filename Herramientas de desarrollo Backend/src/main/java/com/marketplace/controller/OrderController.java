package com.marketplace.controller;

import com.marketplace.model.Order;
import com.marketplace.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestParam(required = false) Long userId) {

        try {

            return ResponseEntity.ok(orderService.createOrderFromCart(userId));

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllOrders(@RequestParam(required = false) Long userId, @RequestParam(required = false) String role) {
        return ResponseEntity.ok(orderService.getAllOrders(userId, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {

        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().body("ID inválido");
        }

        Order order = orderService.findById(id);

        if (order == null) {
            return ResponseEntity.status(404).body("Orden no encontrada");
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) {

        try {

            return ResponseEntity.ok(orderService.payOrder(id));

        } catch (RuntimeException e) {

            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id) {

        try {

            return ResponseEntity.ok(orderService.cancelOrder(id));

        } catch (RuntimeException e) {

            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}