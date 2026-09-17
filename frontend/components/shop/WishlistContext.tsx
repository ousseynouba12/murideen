"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT, isAuthenticated } from "@/lib/auth-client";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "@/lib/wishlist-client";

interface WishlistContextValue {
  ready: boolean;
  authenticated: boolean;
  isLiked: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    function sync() {
      const authed = isAuthenticated();
      setAuthenticated(authed);
      if (!authed) {
        setIds(new Set());
        setReady(true);
        return;
      }
      fetchWishlist()
        .then((products) => setIds(new Set(products.map((p) => p.id))))
        .catch(() => {})
        .finally(() => setReady(true));
    }

    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  const toggle = useCallback(
    async (productId: number) => {
      if (!authenticated) return;
      const wasLiked = ids.has(productId);

      setIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (wasLiked) await removeFromWishlist(productId);
        else await addToWishlist(productId);
      } catch {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [authenticated, ids]
  );

  const isLiked = useCallback((productId: number) => ids.has(productId), [ids]);

  const value = useMemo(() => ({ ready, authenticated, isLiked, toggle }), [ready, authenticated, isLiked, toggle]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist doit être utilisé à l'intérieur de <WishlistProvider>.");
  return ctx;
}
