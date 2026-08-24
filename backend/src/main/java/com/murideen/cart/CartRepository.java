package com.murideen.cart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findBySessionToken(String sessionToken);
    Optional<Cart> findByUserId(Long userId);
}
