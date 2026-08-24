import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/shop-api";
import { ApiError } from "@/lib/api";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { IconChevronLeft } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface Props {
  params: { slug: string };
}

export default async function ProduitPage({ params }: Props) {
  let product;
  try {
    product = await getProductBySlug(params.slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <main>
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-sand/90 px-4 py-3 backdrop-blur">
        <Link href="/catalogue" className="tap-target flex items-center justify-center rounded-full border border-line bg-sand-raised">
          <IconChevronLeft className="h-5 w-5 text-ink-soft" />
        </Link>
        <span className="truncate text-sm font-medium text-ink-soft">{product.categorie.nom}</span>
      </div>
      <ProductDetail product={product} />
    </main>
  );
}
