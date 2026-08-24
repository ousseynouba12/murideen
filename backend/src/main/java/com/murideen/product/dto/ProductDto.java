package com.murideen.product.dto;

import com.murideen.product.Product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDto(
        Long id,
        String nom,
        String slug,
        String description,
        BigDecimal prix,
        CategoryDto categorie,
        List<String> images,
        String statut,
        BigDecimal noteMoyenne,
        int nbAvis,
        int stockTotal,
        List<VariantDto> variantes
) {
    public static ProductDto from(Product p) {
        return new ProductDto(
                p.getId(),
                p.getNom(),
                p.getSlug(),
                p.getDescription(),
                p.getPrix(),
                CategoryDto.from(p.getCategory()),
                p.getImages(),
                p.getStatut().name(),
                p.getNoteMoyenne(),
                p.getNbAvis(),
                p.stockTotal(),
                p.getVariants().stream().map(VariantDto::from).toList()
        );
    }

    public static ProductDto summary(Product p) {
        return from(p);
    }
}
