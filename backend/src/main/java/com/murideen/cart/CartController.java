package com.murideen.cart;

import com.murideen.cart.dto.*;
import com.murideen.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartDto get(@AuthenticationPrincipal User user,
                        @RequestHeader(value = "X-Cart-Token", required = false) String token) {
        return cartService.getCart(user, token);
    }

    @PostMapping
    public CartDto add(@AuthenticationPrincipal User user,
                        @RequestHeader(value = "X-Cart-Token", required = false) String token,
                        @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(user, token, request);
    }

    @PutMapping("/items/{id}")
    public CartDto update(@AuthenticationPrincipal User user,
                           @RequestHeader(value = "X-Cart-Token", required = false) String token,
                           @PathVariable Long id,
                           @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(user, token, id, request);
    }

    @DeleteMapping("/items/{id}")
    public CartDto remove(@AuthenticationPrincipal User user,
                           @RequestHeader(value = "X-Cart-Token", required = false) String token,
                           @PathVariable Long id) {
        return cartService.removeItem(user, token, id);
    }

    @PostMapping("/promo")
    public CartDto applyPromo(@AuthenticationPrincipal User user,
                               @RequestHeader(value = "X-Cart-Token", required = false) String token,
                               @Valid @RequestBody ApplyPromoRequest request) {
        return cartService.applyPromo(user, token, request.code());
    }
}
