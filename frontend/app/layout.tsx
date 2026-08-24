import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Murideen — Mode élégante",
  description: "Murideen : robes, ensembles, boubous et accessoires — boutique de mode en ligne.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-sand text-ink font-body">{children}</body>
    </html>
  );
}
