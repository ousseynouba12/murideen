package com.murideen.settings.dto;

import com.murideen.settings.DeliveryZone;

import java.math.BigDecimal;

public record DeliveryZoneDto(Long id, String nom, BigDecimal frais, String delaiEstime) {
    public static DeliveryZoneDto from(DeliveryZone z) {
        return new DeliveryZoneDto(z.getId(), z.getNom(), z.getFrais(), z.getDelaiEstime());
    }
}
