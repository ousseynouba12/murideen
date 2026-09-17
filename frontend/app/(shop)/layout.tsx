import { BottomNav } from "@/components/shop/BottomNav";
import { WishlistProvider } from "@/components/shop/WishlistContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <div className="min-h-screen bg-sand pb-20">
        {children}
        <BottomNav />
      </div>
    </WishlistProvider>
  );
}
