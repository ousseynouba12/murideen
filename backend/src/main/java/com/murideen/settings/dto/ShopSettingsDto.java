package com.murideen.settings.dto;

import com.murideen.settings.ShopSettings;

import java.math.BigDecimal;

public record ShopSettingsDto(
        String nomBoutique,
        String emailContact,
        String telephoneContact,
        BigDecimal fraisLivraisonDefaut,
        BigDecimal seuilLivraisonOfferte,
        String banniereTitre,
        String banniereTexte,
        boolean banniereActive
) {
    public static ShopSettingsDto from(ShopSettings s) {
        return new ShopSettingsDto(s.getNomBoutique(), s.getEmailContact(), s.getTelephoneContact(),
                s.getFraisLivraisonDefaut(), s.getSeuilLivraisonOfferte(),
                s.getBanniereTitre(), s.getBanniereTexte(), s.isBanniereActive());
    }
}
