package com.murideen.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SettingsService {

    private final ShopSettingsRepository shopSettingsRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;

    public SettingsService(ShopSettingsRepository shopSettingsRepository, DeliveryZoneRepository deliveryZoneRepository) {
        this.shopSettingsRepository = shopSettingsRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
    }

    @Transactional
    public ShopSettings getSettings() {
        return shopSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> shopSettingsRepository.save(new ShopSettings()));
    }

    public BigDecimal computeDeliveryFee(String ville, BigDecimal montantApresRemise) {
        ShopSettings settings = getSettings();
        if (settings.getSeuilLivraisonOfferte() != null
                && montantApresRemise.compareTo(settings.getSeuilLivraisonOfferte()) >= 0) {
            return BigDecimal.ZERO;
        }
        if (ville != null) {
            return deliveryZoneRepository.findFirstByNomIgnoreCase(ville)
                    .map(DeliveryZone::getFrais)
                    .orElse(settings.getFraisLivraisonDefaut());
        }
        return settings.getFraisLivraisonDefaut();
    }
}
