import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Product, CartItem } from "@/types/product";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

import {
  fetchCartItems,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  clearCartItems,
} from "@/services/firebase/cartService";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const cartItems = await fetchCartItems(user.uid);
      setItems(cartItems);
    } catch (error) {
      console.error("[CartContext] Failed to load cart:", error);
      toast.error("Failed to load cart. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (product: Product, size: string, quantity = 1) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      await addCartItem(user.uid, product.id, size, quantity);
      toast.success("Added to cart");
      await loadCart();
    } catch (error) {
      console.error("[CartContext] Failed to add to cart:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!user) return;

    try {
      await removeCartItem(user.uid, productId, size);
      await loadCart();
    } catch (error) {
      console.error("[CartContext] Failed to remove from cart:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const updateQuantity = async (
    productId: string,
    size: string,
    quantity: number
  ) => {
    if (!user) return;

    if (quantity < 1) {
      await removeFromCart(productId, size);
      return;
    }

    try {
      await updateCartItemQuantity(user.uid, productId, size, quantity);
      await loadCart();
    } catch (error) {
      console.error("[CartContext] Failed to update quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await clearCartItems(user.uid);
      setItems([]);
    } catch (error) {
      console.error("[CartContext] Failed to clear cart:", error);
      toast.error("Failed to clear cart. Please try again.");
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};