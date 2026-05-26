package com.marketplace.controller;

import com.marketplace.model.CartItem;
import com.marketplace.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestParam Long productId,
                                 @RequestParam int quantity) {

        try {

            CartItem item = cartService.addProduct(productId, quantity);

            return ResponseEntity.ok(item);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getCart() {

        List<CartItem> cart = cartService.getCart();

        return ResponseEntity.ok(cart);
    }

    @GetMapping("/total")
    public ResponseEntity<?> total() {

        try {

            return ResponseEntity.ok(cartService.total());

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clear() {

        cartService.clearCart();

        return ResponseEntity.ok("Carrito vaciado");
    }
}