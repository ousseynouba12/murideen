package com.murideen.settings;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "shop_settings")
@Getter
@Setter
@NoArgsConstructor
public class ShopSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_boutique", nullable = false)
    private String nomBoutique = "Murideen";

    @Column(name = "email_contact")
    private String emailContact;

    @Column(name = "telephone_contact")
    private String telephoneContact;

    @Column(name = "frais_livraison_defaut", nullable = false, precision = 12, scale = 2)
    private BigDecimal fraisLivraisonDefaut = BigDecimal.valueOf(2000);

    @Column(name = "seuil_livraison_offerte", precision = 12, scale = 2)
    private BigDecimal seuilLivraisonOfferte;

    @Column(name = "banniere_titre")
    private String banniereTitre;

    @Column(name = "banniere_texte")
    private String banniereTexte;

    @Column(name = "banniere_active", nullable = false)
    private boolean banniereActive = false;
}
