package com.murideen.cart.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplyPromoRequest(@NotBlank String code) {}
