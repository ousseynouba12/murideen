package com.murideen.order.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String modePaiement,
        @NotBlank String adresseLivraison,
        String ville,
        @NotBlank String clientNom,
        @NotBlank String clientTelephone,
        String clientEmail
) {}
