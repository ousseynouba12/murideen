package com.murideen.settings;

import com.murideen.settings.dto.DeliveryZoneDto;
import com.murideen.settings.dto.ShopSettingsDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PublicSettingsController {

    private final SettingsService settingsService;
    private final DeliveryZoneRepository deliveryZoneRepository;

    public PublicSettingsController(SettingsService settingsService, DeliveryZoneRepository deliveryZoneRepository) {
        this.settingsService = settingsService;
        this.deliveryZoneRepository = deliveryZoneRepository;
    }

    @GetMapping("/settings/public")
    public ShopSettingsDto publicSettings() {
        return ShopSettingsDto.from(settingsService.getSettings());
    }

    @GetMapping("/delivery-zones")
    public List<DeliveryZoneDto> zones() {
        return deliveryZoneRepository.findAll().stream().map(DeliveryZoneDto::from).toList();
    }
}
