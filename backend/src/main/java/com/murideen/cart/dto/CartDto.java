package com.murideen.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(
        String sessionToken,
        List<CartItemDto> articles,
        BigDecimal sousTotal,
        BigDecimal remise,
        String codePromo,
        int nombreArticles
) {}
