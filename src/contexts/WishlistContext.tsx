import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { toast } from "sonner";

import {
  fetchWishlistIds,
  addWishlistItem,
  removeWishlistItem,
} from "@/services/firebase/wishlistService";

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
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setWishlistIds([]);
      return;
    }

    loadWishlist();
  }, [user, initialized]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ids = await fetchWishlistIds(user.uid);
      setWishlistIds(ids);
    } catch (error) {
      console.error("[WishlistContext] Failed to load wishlist:", error);
      toast.error("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await addWishlistItem(user.uid, productId);
      setWishlistIds((prev) => [...prev, productId]);
      toast.success("Added to wishlist ❤️");
    } catch (error) {
      console.error("[WishlistContext] Failed to add to wishlist:", error);
      toast.error("Failed to add to wishlist.");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await removeWishlistItem(user.uid, productId);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("[WishlistContext] Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist.");
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please log in to use your wishlist.");
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