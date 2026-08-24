import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative" | "neutral" | "warning";
  icon?: ReactNode;
}) {
  const toneStyles: Record<string, { bg: string; fg: string }> = {
    positive: { bg: "var(--ok-tint)", fg: "var(--ok)" },
    negative: { bg: "var(--warn-tint)", fg: "var(--warn)" },
    warning: { bg: "var(--gold-tint)", fg: "var(--gold-deep)" },
    neutral: { bg: "var(--sand-sunken)", fg: "var(--ink-soft)" },
  };
  const style = toneStyles[tone];

  return (
    <div className="rounded-card border border-line bg-sand-raised p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: style.bg, color: style.fg }}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && (
        <span
          className="mt-2 inline-flex rounded-pill px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: style.bg, color: style.fg }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
