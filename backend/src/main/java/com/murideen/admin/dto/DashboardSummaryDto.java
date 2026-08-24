package com.murideen.admin.dto;

import java.math.BigDecimal;

public record DashboardSummaryDto(
        BigDecimal chiffreAffairesJour,
        BigDecimal variationVsHier,
        long commandesEnAttente,
        BigDecimal panierMoyen,
        long rupturesDeStock
) {}
