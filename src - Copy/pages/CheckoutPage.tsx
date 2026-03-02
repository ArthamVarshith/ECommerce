import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CheckoutPage = () => {
  const { items: cartItems, subtotal: totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Checkout</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">Please log in to checkout.</p>
          <Link
            to="/login"
            className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Checkout</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">Your cart is empty.</p>
          <Link
            to="/"
            className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4"
          >
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      items: orderItems,
      total: totalPrice,
      shipping_name: form.name,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_zip: form.zip,
      shipping_country: form.country,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
    } else {
      clearCart();
      toast({ title: "Order placed!", description: "Thank you for your purchase." });
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-3xl lg:text-4xl text-foreground text-center mb-12"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {/* Shipping Form */}
          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-6">
            <h2 className="font-display text-xl text-foreground mb-4">Shipping Details</h2>
            {[
              { label: "Full Name", name: "name" },
              { label: "Address", name: "address" },
              { label: "City", name: "city" },
              { label: "ZIP Code", name: "zip" },
              { label: "Country", name: "country" },
            ].map((field) => (
              <div key={field.name}>
                <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            ))}
          </form>

          {/* Order Summary */}
          <div>
            <h2 className="font-display text-xl text-foreground mb-6">Order Summary</h2>
            <div className="space-y-4 border-b border-border pb-6 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between font-body text-sm">
                  <span className="text-foreground">
                    {item.product.name} ({item.size}) × {item.quantity}
                  </span>
                  <span className="text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-body text-sm mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body text-sm mb-6">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{totalPrice >= 150 ? "Free" : "$12.00"}</span>
            </div>
            <div className="flex justify-between font-display text-xl border-t border-border pt-4 mb-8">
              <span>Total</span>
              <span>${(totalPrice + (totalPrice >= 150 ? 0 : 12)).toFixed(2)}</span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
