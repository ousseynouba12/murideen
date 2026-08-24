const STATUS_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "var(--gold-tint)", fg: "var(--gold-deep)" },
  CONFIRMEE: { label: "Confirmée", bg: "var(--teal-tint)", fg: "var(--teal)" },
  EXPEDIEE: { label: "Expédiée", bg: "var(--wine-tint)", fg: "var(--wine)" },
  LIVREE: { label: "Livrée", bg: "var(--ok-tint)", fg: "var(--ok)" },
  ANNULEE: { label: "Annulée", bg: "var(--warn-tint)", fg: "var(--warn)" },
  ACTIF: { label: "Publié", bg: "var(--ok-tint)", fg: "var(--ok)" },
  BROUILLON: { label: "Brouillon", bg: "var(--sand-sunken)", fg: "var(--ink-soft)" },
  RUPTURE: { label: "Rupture", bg: "var(--warn-tint)", fg: "var(--warn)" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: "var(--sand-sunken)", fg: "var(--ink-soft)" };
  return (
    <span
      className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.fg }}
    >
      {config.label}
    </span>
  );
}
