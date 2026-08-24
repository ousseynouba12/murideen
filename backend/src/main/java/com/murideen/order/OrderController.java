package com.murideen.order;

import com.murideen.order.dto.CheckoutRequest;
import com.murideen.order.dto.CheckoutResponse;
import com.murideen.order.dto.OrderDto;
import com.murideen.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public ResponseEntity<CheckoutResponse> checkout(
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Cart-Token", required = false) String cartToken,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkout(user, cartToken, request));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @GetMapping("/me/orders")
    public List<OrderDto> myOrders(@AuthenticationPrincipal User user) {
        return orderService.listByUser(user.getId());
    }
}
