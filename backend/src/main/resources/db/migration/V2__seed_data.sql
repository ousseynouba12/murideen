-- ============================================================================
-- Murideen — données de démonstration
-- Mot de passe pour tous les comptes de démo : Murideen2026!
-- (hash BCrypt identique réutilisé uniquement à des fins de démonstration)
-- ============================================================================

INSERT INTO users (email, password_hash, nom, telephone, role) VALUES
('proprietaire@murideen-demo.com', '$2b$10$R8Llw0hEAjHnAroIPXThG.unpY07QsxDk6lFEXL.e9RoUw7Id4.M.', 'Awa Diop', '+221770000001', 'PROPRIETAIRE'),
('gestion@murideen-demo.com',      '$2b$10$R8Llw0hEAjHnAroIPXThG.unpY07QsxDk6lFEXL.e9RoUw7Id4.M.', 'Fatou Ndiaye', '+221770000002', 'GESTIONNAIRE'),
('preparation@murideen-demo.com',  '$2b$10$R8Llw0hEAjHnAroIPXThG.unpY07QsxDk6lFEXL.e9RoUw7Id4.M.', 'Moussa Fall', '+221770000003', 'PREPARATION'),
('cliente@murideen-demo.com',      '$2b$10$R8Llw0hEAjHnAroIPXThG.unpY07QsxDk6lFEXL.e9RoUw7Id4.M.', 'Aissatou Ba', '+221770000004', 'CLIENT');

INSERT INTO categories (nom, slug, ordre) VALUES
('Robes', 'robes', 1),
('Ensembles', 'ensembles', 2),
('Boubous', 'boubous', 3),
('Accessoires', 'accessoires', 4);

-- --- Produits : Robes ---
INSERT INTO products (nom, slug, description, prix, category_id, images, statut, note_moyenne, nb_avis, nb_ventes) VALUES
('Robe portefeuille émeraude', 'robe-portefeuille-emeraude', 'Robe portefeuille en satin émeraude, coupe cintrée, idéale pour une soirée élégante.', 45000, (SELECT id FROM categories WHERE slug='robes'), ARRAY['https://placehold.co/800x1000/4A1E2E/F6EFE4?text=Robe+%C3%89meraude'], 'ACTIF', 4.6, 18, 32),
('Robe fourreau bordeaux', 'robe-fourreau-bordeaux', 'Robe fourreau ajustée en bordeaux profond, dos nu, doublure satinée.', 52000, (SELECT id FROM categories WHERE slug='robes'), ARRAY['https://placehold.co/800x1000/6B2C41/F6EFE4?text=Robe+Bordeaux'], 'ACTIF', 4.8, 24, 41),
('Robe wax imprimée ocre', 'robe-wax-imprimee-ocre', 'Robe évasée en wax imprimé ocre et safran, manches trois-quarts.', 38000, (SELECT id FROM categories WHERE slug='robes'), ARRAY['https://placehold.co/800x1000/B9862F/241C19?text=Robe+Wax'], 'ACTIF', 4.5, 12, 20);

-- --- Produits : Ensembles ---
INSERT INTO products (nom, slug, description, prix, category_id, images, statut, note_moyenne, nb_avis, nb_ventes) VALUES
('Ensemble tunique et pantalon perle', 'ensemble-tunique-pantalon-perle', 'Ensemble deux pièces en lin perle, tunique brodée et pantalon fluide.', 42000, (SELECT id FROM categories WHERE slug='ensembles'), ARRAY['https://placehold.co/800x1000/EFE4D2/241C19?text=Ensemble+Perle'], 'ACTIF', 4.4, 9, 15),
('Ensemble crop-top et jupe crayon terracotta', 'ensemble-crop-top-jupe-terracotta', 'Crop-top et jupe crayon assortis, coloris terracotta, tissu structuré.', 39500, (SELECT id FROM categories WHERE slug='ensembles'), ARRAY['https://placehold.co/800x1000/8F6522/F6EFE4?text=Ensemble+Terracotta'], 'ACTIF', 4.7, 15, 27),
('Ensemble deux pièces indigo brodé', 'ensemble-deux-pieces-indigo-brode', 'Ensemble ample brodé main, coloris indigo, parfait pour les grandes occasions.', 58000, (SELECT id FROM categories WHERE slug='ensembles'), ARRAY['https://placehold.co/800x1000/241C19/F6EFE4?text=Ensemble+Indigo'], 'ACTIF', 4.9, 21, 38);

-- --- Produits : Boubous ---
INSERT INTO products (nom, slug, description, prix, category_id, images, statut, note_moyenne, nb_avis, nb_ventes) VALUES
('Boubou brodé ivoire', 'boubou-brode-ivoire', 'Grand boubou en bazin ivoire richement brodé, coupe traditionnelle.', 65000, (SELECT id FROM categories WHERE slug='boubous'), ARRAY['https://placehold.co/800x1000/FFFDF9/4A1E2E?text=Boubou+Ivoire'], 'ACTIF', 4.9, 30, 55),
('Kaftan léger safran', 'kaftan-leger-safran', 'Kaftan léger et fluide coloris safran, idéal pour les journées chaudes.', 34000, (SELECT id FROM categories WHERE slug='boubous'), ARRAY['https://placehold.co/800x1000/B9862F/241C19?text=Kaftan+Safran'], 'ACTIF', 4.3, 8, 14),
('Boubou wax royal violet', 'boubou-wax-royal-violet', 'Boubou en wax violet royal, broderies dorées sur l''encolure.', 61000, (SELECT id FROM categories WHERE slug='boubous'), ARRAY['https://placehold.co/800x1000/4A1E2E/B9862F?text=Boubou+Violet'], 'ACTIF', 4.6, 11, 19),
('Boubou cérémonie corail', 'boubou-ceremonie-corail', 'Boubou de cérémonie coloris corail, tissu bazin riche, finitions main.', 72000, (SELECT id FROM categories WHERE slug='boubous'), ARRAY['https://placehold.co/800x1000/B54B32/F6EFE4?text=Boubou+Corail'], 'BROUILLON', 0, 0, 0);

-- --- Produits : Accessoires ---
INSERT INTO products (nom, slug, description, prix, category_id, images, statut, note_moyenne, nb_avis, nb_ventes) VALUES
('Foulard en soie imprimé doré', 'foulard-soie-imprime-dore', 'Foulard 100% soie, imprimé doré exclusif Murideen.', 15000, (SELECT id FROM categories WHERE slug='accessoires'), ARRAY['https://placehold.co/800x1000/F3E6C9/241C19?text=Foulard+Dor%C3%A9'], 'ACTIF', 4.5, 6, 10),
('Sac cabas tressé naturel', 'sac-cabas-tresse-naturel', 'Sac cabas tressé à la main, finitions cuir, coloris naturel.', 22000, (SELECT id FROM categories WHERE slug='accessoires'), ARRAY['https://placehold.co/800x1000/CDBB9F/241C19?text=Sac+Cabas'], 'ACTIF', 4.2, 5, 8),
('Boucles d''oreilles dorées filigrane', 'boucles-oreilles-dorees-filigrane', 'Boucles d''oreilles en filigrane doré, légères, finition artisanale.', 12500, (SELECT id FROM categories WHERE slug='accessoires'), ARRAY['https://placehold.co/800x1000/8F6522/F6EFE4?text=Boucles+Filigrane'], 'ACTIF', 4.7, 13, 22);

-- --- Variantes (taille x couleur x stock) ---
INSERT INTO product_variants (product_id, taille, couleur, stock)
SELECT p.id, t.taille, c.couleur, (5 + (random() * 15)::int)
FROM products p
CROSS JOIN (VALUES ('S'), ('M'), ('L')) AS t(taille)
CROSS JOIN (VALUES ('Principale')) AS c(couleur)
WHERE p.category_id IN (SELECT id FROM categories WHERE slug IN ('robes','ensembles','boubous'));

INSERT INTO product_variants (product_id, taille, couleur, stock)
SELECT p.id, 'Unique', 'Principale', (5 + (random() * 15)::int)
FROM products p
WHERE p.category_id IN (SELECT id FROM categories WHERE slug = 'accessoires');

-- Quelques ruptures de stock volontaires pour la démo
UPDATE product_variants SET stock = 0
WHERE id IN (
  SELECT pv.id FROM product_variants pv
  JOIN products p ON p.id = pv.product_id
  WHERE p.slug = 'kaftan-leger-safran' AND pv.taille = 'S'
);

-- --- Commandes de démonstration ---
INSERT INTO orders (numero, user_id, statut, mode_paiement, sous_total, livraison, remise, total, adresse_livraison, ville, client_nom, client_telephone, client_email, created_at) VALUES
('MRD-000001', (SELECT id FROM users WHERE email='cliente@murideen-demo.com'), 'LIVREE', 'WAVE', 65000, 2000, 0, 67000, 'Sacré-Cœur 3, Villa 24', 'Dakar', 'Aissatou Ba', '+221770000004', 'cliente@murideen-demo.com', now() - interval '6 days'),
('MRD-000002', (SELECT id FROM users WHERE email='cliente@murideen-demo.com'), 'EXPEDIEE', 'ORANGE_MONEY', 39500, 2000, 0, 41500, 'Sacré-Cœur 3, Villa 24', 'Dakar', 'Aissatou Ba', '+221770000004', 'cliente@murideen-demo.com', now() - interval '3 days'),
('MRD-000003', NULL, 'CONFIRMEE', 'LIVRAISON', 45000, 2500, 0, 47500, 'Cité Keur Gorgui', 'Dakar', 'Khady Sarr', '+221771112233', NULL, now() - interval '1 days'),
('MRD-000004', NULL, 'EN_ATTENTE', 'WAVE', 61000, 2000, 5000, 58000, 'Route de Ouakam', 'Dakar', 'Mariama Cissé', '+221774445566', NULL, now() - interval '4 hours');

INSERT INTO order_items (order_id, product_variant_id, nom_produit, taille, couleur, quantite, prix_unitaire)
SELECT o.id, pv.id, p.nom, pv.taille, pv.couleur, 1, p.prix
FROM orders o
JOIN products p ON p.slug = 'boubou-brode-ivoire'
JOIN product_variants pv ON pv.product_id = p.id AND pv.taille = 'M'
WHERE o.numero = 'MRD-000001';

INSERT INTO order_items (order_id, product_variant_id, nom_produit, taille, couleur, quantite, prix_unitaire)
SELECT o.id, pv.id, p.nom, pv.taille, pv.couleur, 1, p.prix
FROM orders o
JOIN products p ON p.slug = 'ensemble-crop-top-jupe-terracotta'
JOIN product_variants pv ON pv.product_id = p.id AND pv.taille = 'S'
WHERE o.numero = 'MRD-000002';

INSERT INTO order_items (order_id, product_variant_id, nom_produit, taille, couleur, quantite, prix_unitaire)
SELECT o.id, pv.id, p.nom, pv.taille, pv.couleur, 1, p.prix
FROM orders o
JOIN products p ON p.slug = 'robe-portefeuille-emeraude'
JOIN product_variants pv ON pv.product_id = p.id AND pv.taille = 'L'
WHERE o.numero = 'MRD-000003';

INSERT INTO order_items (order_id, product_variant_id, nom_produit, taille, couleur, quantite, prix_unitaire)
SELECT o.id, pv.id, p.nom, pv.taille, pv.couleur, 1, p.prix
FROM orders o
JOIN products p ON p.slug = 'boubou-wax-royal-violet'
JOIN product_variants pv ON pv.product_id = p.id AND pv.taille = 'M'
WHERE o.numero = 'MRD-000004';

INSERT INTO payments (order_id, provider, statut, reference_externe, montant)
SELECT id, mode_paiement, CASE WHEN statut = 'EN_ATTENTE' THEN 'EN_ATTENTE' ELSE 'REUSSI' END, 'DEMO-REF-' || numero, total
FROM orders;

-- --- Promotions ---
INSERT INTO promotions (code, type, valeur, date_debut, date_fin, actif) VALUES
('BIENVENUE10', 'POURCENTAGE', 10, now() - interval '10 days', now() + interval '80 days', true),
('LIVRAISONOFFERTE', 'LIVRAISON_OFFERTE', 0, now() - interval '5 days', now() + interval '25 days', true);

-- --- Réglages boutique ---
INSERT INTO shop_settings (nom_boutique, email_contact, telephone_contact, frais_livraison_defaut, seuil_livraison_offerte, banniere_titre, banniere_texte, banniere_active) VALUES
('Murideen', 'contact@murideen-demo.com', '+221770000000', 2000, 75000, 'Nouvelle collection', 'Découvrez les nouveaux boubous brodés, en édition limitée.', true);

INSERT INTO delivery_zones (nom, frais, delai_estime) VALUES
('Dakar centre', 1500, '24-48h'),
('Banlieue de Dakar', 2500, '48-72h'),
('Régions', 4000, '3-5 jours');
