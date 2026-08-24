package com.murideen.cart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productVariantId,
        Long productId,
        String nom,
        String slug,
        String image,
        String taille,
        String couleur,
        int quantite,
        int stockDisponible,
        BigDecimal prixUnitaire,
        BigDecimal sousTotal
) {}
