package com.murideen.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TeamMemberRequest(
        @NotBlank @Email String email,
        String motDePasse,
        @NotBlank String nom,
        String telephone,
        @NotBlank String role
) {}
