package com.murideen.admin.dto;

import java.math.BigDecimal;

public record CustomerDto(
        Long id,
        String nom,
        String email,
        String telephone,
        long nombreCommandes,
        BigDecimal totalDepense
) {}
