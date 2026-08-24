# Murideen

Plateforme e-commerce complète pour **Murideen**, boutique de mode en ligne (robes, ensembles, boubous, accessoires) à vendeur unique. Le projet comprend :

- Un **backend** Spring Boot 3 / Java 21 (API REST, PostgreSQL, Redis, JWT).
- Un **frontend** Next.js 14 (App Router) qui sert à la fois la boutique (`/`, `/catalogue`, `/produit/...`, `/panier`, `/compte`) et le back-office (`/admin/...`).
- Une **infrastructure Docker Compose** pour le développement local et la production.

Toute l'interface visible (boutique et back-office) est en français, avec les prix affichés en FCFA (`32 000 FCFA`).

## Stack

| Domaine | Choix |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript strict, Tailwind CSS |
| Backend | Spring Boot 3, Java 21, Spring Data JPA, Spring Security (JWT) |
| Base de données | PostgreSQL 16 |
| Cache | Redis 7 (cache applicatif Spring + Data Cache/ISR côté Next.js) |
| Stockage images | Cloudflare R2 (API compatible S3) |
| Paiement | Wave / Orange Money via une passerelle configurable (CinetPay par défaut, PayDunya en alternative) + paiement à la livraison |
| Conteneurs | Docker + Docker Compose |

## Démarrage rapide (développement local)

Prérequis : Docker et Docker Compose.

```bash
git clone <votre-dépôt> murideen
cd murideen
cp .env.example .env
docker compose up --build
```

- Boutique : http://localhost:3000
- Back-office : http://localhost:3000/admin/connexion
- API : http://localhost:8080 (documentation Swagger sur http://localhost:8080/docs)

Au premier démarrage, Flyway applique automatiquement les migrations (`backend/src/main/resources/db/migration`) et charge un **jeu de données de démonstration** : 4 catégories, une douzaine de produits avec variantes/stock, quelques commandes à différents statuts, et des comptes de test.

### Comptes de démonstration

Mot de passe pour tous les comptes : **`Murideen2026!`**

| Rôle | E-mail |
|---|---|
| Propriétaire | `proprietaire@murideen-demo.com` |
| Gestionnaire | `gestion@murideen-demo.com` |
| Préparation | `preparation@murideen-demo.com` |
| Cliente | `cliente@murideen-demo.com` |

## Structure du dépôt

```
murideen/
├── docker-compose.yml          # environnement de développement
├── docker-compose.prod.yml     # environnement de production (VPS)
├── .env.example
├── backend/                    # API Spring Boot
│   └── src/main/java/com/murideen/{config,product,order,payment,user,promotion,review,wishlist,cart,admin,notification,storage,settings,common}
└── frontend/                   # Next.js (boutique + back-office)
    ├── app/(shop)/              → /, /catalogue, /produit/[slug], /panier, /compte
    └── app/(admin)/admin/       → /admin, /admin/commandes, /admin/catalogue, /admin/clients, /admin/promotions, /admin/reglages
```

## Variables d'environnement

Voir `.env.example` pour la liste complète (base de données, JWT, Redis, Cloudflare R2, passerelle de paiement, SMTP...). Copiez-le en `.env` et remplacez les valeurs de démonstration avant tout déploiement réel. **Ne commitez jamais de vraies clés.**

## Développement sans Docker (optionnel)

**Backend** (nécessite Java 21, PostgreSQL et Redis locaux ou via `docker compose up db redis`) :

```bash
cd backend
./mvnw spring-boot:run
```

**Frontend** (nécessite Node.js 20+) :

```bash
cd frontend
npm install
npm run dev
```

## Paiement

Le backend expose une abstraction `PaymentProvider` (`initiate(order)` / `handleWebhook(payload)`) avec deux implémentations concrètes : **CinetPay** (par défaut) et **PayDunya**. Le fournisseur actif se règle via `PAYMENT_PROVIDER` dans `.env`. Le mode « paiement à la livraison » ne passe par aucune passerelle : la commande est créée au statut `EN_ATTENTE` et son statut est mis à jour manuellement depuis le back-office.

Sans clés API réelles configurées (valeurs `demo_...`), le backend renvoie une URL de paiement de démonstration au lieu d'appeler le vrai prestataire, pour que le parcours de commande reste testable de bout en bout.

## Cache et revalidation

- **Redis côté Spring Boot** : `@Cacheable` sur les catégories, les meilleures ventes et le résumé du tableau de bord (TTL 5–15 min), avec `@CacheEvict` explicite à chaque modification de produit ou de commande.
- **Next.js (Data Cache / ISR)** : les pages catalogue et fiche produit utilisent `fetch(..., { next: { revalidate } })`. Le backend appelle `POST /api/revalidate` (route interne Next.js protégée par le secret `JWT_SECRET`) à chaque création/modification/suppression de produit, pour une revalidation à la demande.

## Notifications

`NotificationService.notifyOrderStatusChange(order)` est diffusé à chaque changement de statut de commande. Deux implémentations sont branchées : un envoi e-mail (SMTP configurable, fonctionnel dès la V1) et un point d'intégration WhatsApp/SMS qui journalise l'intention d'envoi (le prestataire n'est pas encore choisi — à finaliser plus tard).

## Déploiement en production (VPS unique)

```bash
cp .env.example .env   # renseigner les vraies valeurs
docker compose -f docker-compose.prod.yml up -d --build
```

`docker-compose.prod.yml` n'expose pas PostgreSQL/Redis publiquement, ajoute des healthchecks et `restart: unless-stopped`. Placez Cloudflare (proxy + TLS) devant le service `frontend` (port 80) **et** devant le service `backend` (port 8080), par exemple via un sous-domaine `api.votre-domaine.com` — le navigateur de la cliente appelle l'API directement (`NEXT_PUBLIC_API_URL`), le backend doit donc être joignable publiquement, pas seulement depuis le réseau Docker interne. Renseignez `PUBLIC_API_URL` dans `.env` avec cette URL publique avant le build : elle est intégrée au bundle du frontend au moment de `docker compose build` (variable `NEXT_PUBLIC_...`, donc figée au build, pas au runtime).

## Limites connues de cette V1 (à signaler à la cliente)

- Les identifiants Cloudflare R2, CinetPay/PayDunya et SMTP dans `.env.example` sont des valeurs de démonstration explicitement marquées `demo_...` — à remplacer avant mise en production.
- Les images de démonstration du catalogue pointent vers `placehold.co` (aucune vraie photo produit n'a été fournie).
- Le canal de notification WhatsApp/SMS journalise seulement l'intention d'envoi ; le prestataire n'est pas encore choisi.
- La liste d'envies utilise un état local (icône cœur) sur la grille produits ; sa persistance complète passe par `/api/me/wishlist` (déjà exposé côté API) et reste à relier à l'icône du catalogue.
