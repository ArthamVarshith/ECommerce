import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType>(
  {} as WishlistContextType
);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, initialized } = useAuth();
  const { toast } = useToast();

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load wishlist safely
  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setWishlistIds([]);
      return;
    }

    fetchWishlist();
  }, [user, initialized]);

  const fetchWishlist = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setWishlistIds(data.map((w) => w.product_id));
    }

    setLoading(false);
  };

  // ✅ ADD
  const addToWishlist = async (productId: string) => {
    if (!user) return;

    await supabase.from("wishlists").insert({
      user_id: user.id,
      product_id: productId,
    });

    setWishlistIds((prev) => [...prev, productId]);

    toast({ title: "Added to wishlist ❤️" });
  };

  // ✅ REMOVE (THIS WAS MISSING)
  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    setWishlistIds((prev) =>
      prev.filter((id) => id !== productId)
    );

    toast({ title: "Removed from wishlist" });
  };

  // ✅ TOGGLE
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "Login required for wishlist",
      });
      return;
    }

    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId: string) =>
    wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};