package com.murideen.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpsertRequest(
        @NotBlank String nom,
        String description,
        @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal prix,
        @NotNull Long categoryId,
        List<String> images,
        String statut,
        List<VariantRequest> variantes
) {
    public record VariantRequest(Long id, @NotBlank String taille, @NotBlank String couleur, int stock) {}
}
