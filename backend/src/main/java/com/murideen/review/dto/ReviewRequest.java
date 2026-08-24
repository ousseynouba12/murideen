package com.murideen.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ReviewRequest(@Min(1) @Max(5) int note, String commentaire) {}
