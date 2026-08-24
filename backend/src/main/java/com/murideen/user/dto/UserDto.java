package com.murideen.user.dto;

import com.murideen.user.Role;
import com.murideen.user.User;

public record UserDto(Long id, String email, String nom, String telephone, Role role) {
    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getNom(), user.getTelephone(), user.getRole());
    }
}
