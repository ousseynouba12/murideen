package com.murideen.order.dto;

import com.murideen.order.OrderItem;

import java.math.BigDecimal;

public record OrderItemDto(
        Long id,
        Long productVariantId,
        String nomProduit,
        String taille,
        String couleur,
        int quantite,
        BigDecimal prixUnitaire
) {
    public static OrderItemDto from(OrderItem item) {
        return new OrderItemDto(
                item.getId(), item.getProductVariant().getId(), item.getNomProduit(),
                item.getTaille(), item.getCouleur(), item.getQuantite(), item.getPrixUnitaire()
        );
    }
}
