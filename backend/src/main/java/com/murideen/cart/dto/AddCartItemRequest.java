package com.murideen.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull Long productVariantId,
        @Min(1) int quantite
) {}
