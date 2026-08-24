package com.murideen.promotion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public record PromotionUpsertRequest(
        @NotBlank String code,
        @NotNull String type,
        BigDecimal valeur,
        Instant dateDebut,
        Instant dateFin,
        boolean actif,
        Long categoryId
) {}
