package com.murideen.user;

import com.murideen.common.ApiException;
import com.murideen.user.dto.RoleUpdateRequest;
import com.murideen.user.dto.TeamMemberRequest;
import com.murideen.user.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.List;

@RestController
@RequestMapping("/api/admin/team")
@PreAuthorize("hasRole('PROPRIETAIRE')")
public class AdminTeamController {

    private static final List<Role> STAFF_ROLES = List.of(Role.PROPRIETAIRE, Role.GESTIONNAIRE, Role.PREPARATION);
    private static final String CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminTeamController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UserDto> list() {
        return userRepository.findAll().stream()
                .filter(u -> STAFF_ROLES.contains(u.getRole()))
                .map(UserDto::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody TeamMemberRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Un compte existe déjà avec cet e-mail.");
        }
        Role role = parseStaffRole(request.role());
        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        String rawPassword = (request.motDePasse() == null || request.motDePasse().isBlank())
                ? generateTemporaryPassword() : request.motDePasse();
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setNom(request.nom());
        user.setTelephone(request.telephone());
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(UserDto.from(user));
    }

    @PutMapping("/{id}/role")
    public UserDto updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Membre de l'équipe introuvable."));
        user.setRole(parseStaffRole(request.role()));
        userRepository.save(user);
        return UserDto.from(user);
    }

    @PutMapping("/{id}/desactiver")
    public UserDto deactivate(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Membre de l'équipe introuvable."));
        user.setActif(false);
        userRepository.save(user);
        return UserDto.from(user);
    }

    private Role parseStaffRole(String role) {
        try {
            Role r = Role.valueOf(role);
            if (!STAFF_ROLES.contains(r)) throw new IllegalArgumentException();
            return r;
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Rôle invalide.");
        }
    }

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(CHARSET.charAt(random.nextInt(CHARSET.length())));
        }
        return sb.toString();
    }
}
