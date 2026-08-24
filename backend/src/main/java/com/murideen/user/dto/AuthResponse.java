package com.murideen.user.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto utilisateur
) {}
