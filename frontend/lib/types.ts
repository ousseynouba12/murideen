export interface Category {
  id: number;
  nom: string;
  slug: string;
  ordre: number;
}

export interface Variant {
  id: number;
  taille: string;
  couleur: string;
  stock: number;
}

export interface Product {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  prix: number;
  categorie: Category;
  images: string[];
  statut: "ACTIF" | "BROUILLON";
  noteMoyenne: number;
  nbAvis: number;
  stockTotal: number;
  variantes: Variant[];
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CartItem {
  id: number;
  productVariantId: number;
  productId: number;
  nom: string;
  slug: string;
  image: string | null;
  taille: string;
  couleur: string;
  quantite: number;
  stockDisponible: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface CartResponse {
  sessionToken: string;
  articles: CartItem[];
  sousTotal: number;
  remise: number;
  codePromo: string | null;
  nombreArticles: number;
}

export interface OrderItem {
  id: number;
  productVariantId: number;
  nomProduit: string;
  taille: string;
  couleur: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Order {
  id: number;
  numero: string;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EXPEDIEE" | "LIVREE" | "ANNULEE";
  modePaiement: "WAVE" | "ORANGE_MONEY" | "LIVRAISON";
  sousTotal: number;
  livraison: number;
  remise: number;
  total: number;
  adresseLivraison: string;
  ville: string | null;
  clientNom: string;
  clientTelephone: string;
  clientEmail: string | null;
  articles: OrderItem[];
  createdAt: string;
}

export interface UserProfile {
  id: number;
  email: string;
  nom: string;
  telephone: string | null;
  role: "CLIENT" | "PROPRIETAIRE" | "GESTIONNAIRE" | "PREPARATION";
}

export interface DashboardSummary {
  chiffreAffairesJour: number;
  variationVsHier: number;
  commandesEnAttente: number;
  panierMoyen: number;
  rupturesDeStock: number;
}

export interface SalesPoint {
  date: string;
  total: number;
  nombreCommandes: number;
}

export interface BestSeller {
  productId: number;
  nom: string;
  nbVentes: number;
  proportion: number;
}

export interface LowStock {
  productId: number;
  nom: string;
  taille: string;
  couleur: string;
  stock: number;
}

export interface Customer {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  nombreCommandes: number;
  totalDepense: number;
}

export interface Promotion {
  id: number;
  code: string;
  type: "POURCENTAGE" | "MONTANT_FIXE" | "LIVRAISON_OFFERTE";
  valeur: number;
  dateDebut: string | null;
  dateFin: string | null;
  actif: boolean;
  categoryId: number | null;
  categoryNom: string | null;
}
