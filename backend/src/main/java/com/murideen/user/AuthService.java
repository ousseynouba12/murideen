package com.murideen.user;

import com.murideen.common.ApiException;
import com.murideen.config.JwtService;
import com.murideen.user.dto.AuthResponse;
import com.murideen.user.dto.LoginRequest;
import com.murideen.user.dto.RegisterRequest;
import com.murideen.user.dto.UserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Un compte existe déjà avec cet e-mail.");
        }
        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.motDePasse()));
        user.setNom(request.nom());
        user.setTelephone(request.telephone());
        user.setRole(Role.CLIENT);
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> ApiException.badRequest("E-mail ou mot de passe incorrect."));
        if (!passwordEncoder.matches(request.motDePasse(), user.getPasswordHash())) {
            throw ApiException.badRequest("E-mail ou mot de passe incorrect.");
        }
        if (!user.isActif()) {
            throw ApiException.forbidden("Ce compte a été désactivé.");
        }
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> ApiException.badRequest("Jeton de rafraîchissement invalide."));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw ApiException.badRequest("Jeton de rafraîchissement expiré.");
        }
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        return buildAuthResponse(stored.getUser());
    }

    private AuthResponse buildAuthResponse(User user) {
        String access = jwtService.generateAccessToken(user.getEmail(), user.getRole().name(), user.getId());
        String refreshValue = jwtService.generateRefreshTokenValue(user.getEmail());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshValue);
        refreshToken.setExpiresAt(jwtService.refreshExpiry());
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(access, refreshValue, UserDto.from(user));
    }
}
