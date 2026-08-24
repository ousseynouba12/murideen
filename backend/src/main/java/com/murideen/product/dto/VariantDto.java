package com.murideen.product.dto;

import com.murideen.product.ProductVariant;

public record VariantDto(Long id, String taille, String couleur, int stock) {
    public static VariantDto from(ProductVariant v) {
        return new VariantDto(v.getId(), v.getTaille(), v.getCouleur(), v.getStock());
    }
}
