package com.marketplace.repository;

import com.marketplace.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdAndOrderIsNull(Long userId);
    List<CartItem> findByOrderIsNull();
    List<CartItem> findByUserId(Long userId);
}