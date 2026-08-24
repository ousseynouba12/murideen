package com.murideen.settings;

import com.murideen.common.ApiException;
import com.murideen.settings.dto.DeliveryZoneDto;
import com.murideen.settings.dto.ShopSettingsDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('PROPRIETAIRE')")
public class AdminSettingsController {

    private final ShopSettingsRepository shopSettingsRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final SettingsService settingsService;

    public AdminSettingsController(ShopSettingsRepository shopSettingsRepository,
                                    DeliveryZoneRepository deliveryZoneRepository,
                                    SettingsService settingsService) {
        this.shopSettingsRepository = shopSettingsRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.settingsService = settingsService;
    }

    @GetMapping
    public ShopSettingsDto get() {
        return ShopSettingsDto.from(settingsService.getSettings());
    }

    @PutMapping
    public ShopSettingsDto update(@Valid @RequestBody ShopSettingsDto dto) {
        ShopSettings settings = settingsService.getSettings();
        settings.setNomBoutique(dto.nomBoutique());
        settings.setEmailContact(dto.emailContact());
        settings.setTelephoneContact(dto.telephoneContact());
        settings.setFraisLivraisonDefaut(dto.fraisLivraisonDefaut());
        settings.setSeuilLivraisonOfferte(dto.seuilLivraisonOfferte());
        settings.setBanniereTitre(dto.banniereTitre());
        settings.setBanniereTexte(dto.banniereTexte());
        settings.setBanniereActive(dto.banniereActive());
        shopSettingsRepository.save(settings);
        return ShopSettingsDto.from(settings);
    }

    @GetMapping("/zones")
    public List<DeliveryZoneDto> zones() {
        return deliveryZoneRepository.findAll().stream().map(DeliveryZoneDto::from).toList();
    }

    @PostMapping("/zones")
    public DeliveryZoneDto createZone(@Valid @RequestBody ZoneRequest request) {
        DeliveryZone zone = new DeliveryZone();
        apply(zone, request);
        deliveryZoneRepository.save(zone);
        return DeliveryZoneDto.from(zone);
    }

    @PutMapping("/zones/{id}")
    public DeliveryZoneDto updateZone(@PathVariable Long id, @Valid @RequestBody ZoneRequest request) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Zone de livraison introuvable."));
        apply(zone, request);
        deliveryZoneRepository.save(zone);
        return DeliveryZoneDto.from(zone);
    }

    @DeleteMapping("/zones/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable Long id) {
        deliveryZoneRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void apply(DeliveryZone zone, ZoneRequest request) {
        zone.setNom(request.nom());
        zone.setFrais(request.frais());
        zone.setDelaiEstime(request.delaiEstime());
    }

    public record ZoneRequest(@NotBlank String nom, @NotNull BigDecimal frais, String delaiEstime) {}
}
