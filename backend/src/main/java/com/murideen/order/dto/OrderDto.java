package com.murideen.order.dto;

import com.murideen.order.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDto(
        Long id,
        String numero,
        String statut,
        String modePaiement,
        BigDecimal sousTotal,
        BigDecimal livraison,
        BigDecimal remise,
        BigDecimal total,
        String adresseLivraison,
        String ville,
        String clientNom,
        String clientTelephone,
        String clientEmail,
        List<OrderItemDto> articles,
        Instant createdAt
) {
    public static OrderDto from(Order o) {
        return new OrderDto(
                o.getId(), o.getNumero(), o.getStatut().name(), o.getModePaiement().name(),
                o.getSousTotal(), o.getLivraison(), o.getRemise(), o.getTotal(),
                o.getAdresseLivraison(), o.getVille(), o.getClientNom(), o.getClientTelephone(), o.getClientEmail(),
                o.getItems().stream().map(OrderItemDto::from).toList(),
                o.getCreatedAt()
        );
    }
}
