package com.murideen.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesPointDto(LocalDate date, BigDecimal total, long nombreCommandes) {}
