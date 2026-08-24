package com.murideen.promotion.dto;

import com.murideen.promotion.Promotion;

import java.math.BigDecimal;
import java.time.Instant;

public record PromotionDto(
        Long id,
        String code,
        String type,
        BigDecimal valeur,
        Instant dateDebut,
        Instant dateFin,
        boolean actif,
        Long categoryId,
        String categoryNom
) {
    public static PromotionDto from(Promotion p) {
        return new PromotionDto(
                p.getId(), p.getCode(), p.getType().name(), p.getValeur(),
                p.getDateDebut(), p.getDateFin(), p.isActif(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getNom() : null
        );
    }
}
