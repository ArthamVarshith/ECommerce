import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

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

  /*
  =====================================
  LOAD WISHLIST
  =====================================
  */
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

    const wishlistRef = collection(db, "users", user.uid, "wishlist");
    const snapshot = await getDocs(wishlistRef);

    const ids = snapshot.docs.map(
      (docSnap) => docSnap.data().productId
    );

    setWishlistIds(ids);
    setLoading(false);
  };

  /*
  =====================================
  ADD
  =====================================
  */
  const addToWishlist = async (productId: string) => {
    if (!user) return;

    const wishlistRef = collection(db, "users", user.uid, "wishlist");

    await addDoc(wishlistRef, {
      productId,
    });

    setWishlistIds((prev) => [...prev, productId]);

    toast({
      title: "Added to wishlist ❤️",
    });
  };

  /*
  =====================================
  REMOVE
  =====================================
  */
  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    const wishlistRef = collection(db, "users", user.uid, "wishlist");

    const q = query(
      wishlistRef,
      where("productId", "==", productId)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

    setWishlistIds((prev) =>
      prev.filter((id) => id !== productId)
    );

    toast({
      title: "Removed from wishlist",
    });
  };

  /*
  =====================================
  TOGGLE
  =====================================
  */
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