package com.murideen.order.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderStatusUpdateRequest(@NotBlank String statut) {}
