import { supabase } from "@/integrations/supabase/client";
import { products } from "@/data/products";
import { CartItem, Product } from "@/types/product";

/*
------------------------------------
GET PRODUCT FROM LOCAL FILE
------------------------------------
*/
const getProduct = (productId: string): Product | undefined => {
  return products.find((p) => p.id === productId);
};

/*
------------------------------------
GET CART ITEMS
------------------------------------
*/
export const getCartItems = async (
  userId: string
): Promise<CartItem[]> => {

  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }

  const cartItems: CartItem[] = data
    .map((item) => {
      const product = getProduct(item.product_id);

      if (!product) return null;

      return {
        product,
        quantity: item.quantity,
        size: item.size,
      };
    })
    .filter(Boolean) as CartItem[];

  return cartItems;
};

/*
------------------------------------
ADD TO CART
------------------------------------
*/
export const addToCart = async (
  userId: string,
  productId: string,
  size: string,
  quantity: number
) => {

  const { data: existing } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  if (existing) {
    await supabase
      .from("carts")
      .update({
        quantity: existing.quantity + quantity,
      })
      .eq("id", existing.id);

    return;
  }

  await supabase.from("carts").insert({
    user_id: userId,
    product_id: productId,
    size,
    quantity,
  });
};

/*
------------------------------------
REMOVE ITEM
------------------------------------
*/
export const removeFromCart = async (cartId: string) => {
  await supabase
    .from("carts")
    .delete()
    .eq("id", cartId);
};

/*
------------------------------------
CLEAR CART
------------------------------------
*/
export const clearCart = async (userId: string) => {
  await supabase
    .from("carts")
    .delete()
    .eq("user_id", userId);
};