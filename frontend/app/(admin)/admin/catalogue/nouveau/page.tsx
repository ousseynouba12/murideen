import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/Icons";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NouveauProduitPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/catalogue" className="tap-target flex items-center justify-center rounded-full border border-line bg-sand-raised">
          <IconChevronLeft className="h-5 w-5 text-ink-soft" />
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink">Nouveau produit</h1>
      </div>
      <ProductForm />
    </div>
  );
}
