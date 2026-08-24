import { BottomNav } from "@/components/shop/BottomNav";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
