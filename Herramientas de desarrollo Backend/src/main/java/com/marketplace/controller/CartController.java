package com.marketplace.controller;

import com.marketplace.model.CartItem;
import com.marketplace.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestParam Long productId,
                                 @RequestParam int quantity,
                                 @RequestParam(required = false) Long userId) {

        try {

            CartItem item = cartService.addProduct(productId, quantity, userId);

            return ResponseEntity.ok(item);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getCart(@RequestParam(required = false) Long userId) {

        List<CartItem> cart = cartService.getCart(userId);

        return ResponseEntity.ok(cart);
    }

    @GetMapping("/total")
    public ResponseEntity<?> total(@RequestParam(required = false) Long userId) {

        try {

            double total = cartService.getCart(userId).stream()
                    .mapToDouble(CartItem::getSubtotal)
                    .sum();
            return ResponseEntity.ok(total);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Long id) {
        try {
            cartService.removeCartItem(id);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Ítem eliminado del carrito"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<?> updateQuantity(@PathVariable Long id, @RequestParam int quantity) {
        try {
            CartItem item = cartService.updateQuantity(id, quantity);
            if (item != null) {
                return ResponseEntity.ok(item);
            } else {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Ítem eliminado del carrito"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clear(@RequestParam(required = false) Long userId) {

        cartService.clearCart(userId);

        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Carrito vaciado"));
    }
}