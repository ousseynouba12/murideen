"use client";

import type { SalesPoint } from "@/lib/types";
import { formatFCFA } from "@/lib/format";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_X = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;

export function SalesAreaChart({ data }: { data: SalesPoint[] }) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-ink-soft">Pas encore de données de vente.</p>;
  }

  const max = Math.max(...data.map((d) => d.total), 1);
  const stepX = (WIDTH - PAD_X * 2) / (data.length - 1 || 1);
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + i * stepX;
    const y = PAD_TOP + innerHeight - (d.total / max) * innerHeight;
    return { x, y, d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_TOP + innerHeight} L${points[0].x},${PAD_TOP + innerHeight} Z`;

  const last = points[points.length - 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[480px] w-full" role="img" aria-label="Ventes des 7 derniers jours">
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--wine)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--wine)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#salesGradient)" />
        <path d={linePath} fill="none" stroke="var(--wine)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={i === points.length - 1 ? "var(--wine)" : "var(--sand-raised)"} stroke="var(--wine)" strokeWidth={1.5} />
        ))}
        <circle cx={last.x} cy={last.y} r={9} fill="var(--wine)" opacity={0.15} />
        {points.map((p, i) => (
          <text key={i} x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="10" fill="var(--ink-faint)" fontFamily="Jost, sans-serif">
            {new Date(p.d.date).toLocaleDateString("fr-FR", { weekday: "short" })}
          </text>
        ))}
      </svg>
      <p className="mt-1 text-sm font-medium text-wine">{formatFCFA(last.d.total)} aujourd'hui</p>
    </div>
  );
}
