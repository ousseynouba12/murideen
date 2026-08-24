package com.murideen.product.dto;

import com.murideen.product.Category;

public record CategoryDto(Long id, String nom, String slug, int ordre) {
    public static CategoryDto from(Category c) {
        return new CategoryDto(c.getId(), c.getNom(), c.getSlug(), c.getOrdre());
    }
}
