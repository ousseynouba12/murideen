-- ============================================================================
-- Murideen — schéma initial
-- ============================================================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    telephone       VARCHAR(30),
    role            VARCHAR(30) NOT NULL DEFAULT 'CLIENT',
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL UNIQUE,
    expires_at      TIMESTAMP NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(120) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    ordre           INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    description     TEXT,
    prix            NUMERIC(12,2) NOT NULL,
    category_id     BIGINT NOT NULL REFERENCES categories(id),
    images          TEXT[] NOT NULL DEFAULT '{}',
    statut          VARCHAR(20) NOT NULL DEFAULT 'BROUILLON', -- ACTIF, BROUILLON
    note_moyenne    NUMERIC(3,2) NOT NULL DEFAULT 0,
    nb_avis         INT NOT NULL DEFAULT 0,
    nb_ventes       INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_statut ON products(statut);

CREATE TABLE product_variants (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    taille          VARCHAR(20) NOT NULL,
    couleur         VARCHAR(60) NOT NULL,
    stock           INT NOT NULL DEFAULT 0,
    UNIQUE(product_id, taille, couleur)
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

CREATE TABLE promotions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    type            VARCHAR(30) NOT NULL, -- POURCENTAGE, MONTANT_FIXE, LIVRAISON_OFFERTE
    valeur          NUMERIC(12,2) NOT NULL DEFAULT 0,
    date_debut      TIMESTAMP,
    date_fin        TIMESTAMP,
    actif           BOOLEAN NOT NULL DEFAULT TRUE,
    category_id     BIGINT REFERENCES categories(id),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE carts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_token   VARCHAR(100) UNIQUE,
    promotion_id    BIGINT REFERENCES promotions(id),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
    id                  BIGSERIAL PRIMARY KEY,
    cart_id             BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_variant_id  BIGINT NOT NULL REFERENCES product_variants(id),
    quantite            INT NOT NULL DEFAULT 1
);

CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(30) NOT NULL UNIQUE,
    user_id             BIGINT REFERENCES users(id),
    statut              VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, CONFIRMEE, EXPEDIEE, LIVREE, ANNULEE
    mode_paiement       VARCHAR(20) NOT NULL, -- WAVE, ORANGE_MONEY, LIVRAISON
    sous_total          NUMERIC(12,2) NOT NULL,
    livraison           NUMERIC(12,2) NOT NULL DEFAULT 0,
    remise              NUMERIC(12,2) NOT NULL DEFAULT 0,
    total               NUMERIC(12,2) NOT NULL,
    adresse_livraison   TEXT NOT NULL,
    ville               VARCHAR(100),
    client_nom          VARCHAR(150) NOT NULL,
    client_telephone    VARCHAR(30) NOT NULL,
    client_email        VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_statut ON orders(statut);
CREATE INDEX idx_orders_created ON orders(created_at);

CREATE TABLE order_items (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_variant_id  BIGINT NOT NULL REFERENCES product_variants(id),
    nom_produit         VARCHAR(200) NOT NULL,
    taille              VARCHAR(20) NOT NULL,
    couleur             VARCHAR(60) NOT NULL,
    quantite            INT NOT NULL,
    prix_unitaire       NUMERIC(12,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider            VARCHAR(30) NOT NULL,
    statut              VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, REUSSI, ECHOUE
    reference_externe   VARCHAR(150),
    montant             NUMERIC(12,2) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments(order_id);

CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note            INT NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(product_id, user_id)
);

CREATE TABLE wishlist_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE shop_settings (
    id                      BIGSERIAL PRIMARY KEY,
    nom_boutique            VARCHAR(150) NOT NULL DEFAULT 'Murideen',
    email_contact           VARCHAR(255),
    telephone_contact       VARCHAR(30),
    frais_livraison_defaut  NUMERIC(12,2) NOT NULL DEFAULT 2000,
    seuil_livraison_offerte NUMERIC(12,2),
    banniere_titre          VARCHAR(200),
    banniere_texte          VARCHAR(400),
    banniere_active         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE delivery_zones (
    id              BIGSERIAL PRIMARY KEY,
    nom             VARCHAR(150) NOT NULL,
    frais           NUMERIC(12,2) NOT NULL DEFAULT 0,
    delai_estime    VARCHAR(100)
);
