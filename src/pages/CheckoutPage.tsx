import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { placeOrder } from "@/services/firebase/orderService";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CheckoutPage = () => {
  const { items: cartItems, subtotal: totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
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
          <p className="font-body text-sm text-muted-foreground mb-6">
            Please log in to checkout.
          </p>
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
          <p className="font-body text-sm text-muted-foreground mb-6">
            Your cart is empty.
          </p>
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

  // Use settings from Firestore
  const freeThreshold = settings.freeShippingThreshold;
  const stdShippingCost = settings.standardShippingCost;
  const shippingCost = totalPrice >= freeThreshold ? 0 : stdShippingCost;
  const taxRate = settings.taxRate;
  const taxAmount = totalPrice * (taxRate / 100);
  const orderTotal = totalPrice + shippingCost + taxAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await placeOrder(
        user.uid,
        user.email ?? "",
        cartItems,
        totalPrice,
        shippingCost,
        orderTotal,
        {
          name: form.name,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        }
      );

      // Clear local cart state after successful atomic order
      clearCart();

      toast.success("Order placed! Thank you for your purchase.");
      navigate("/");
    } catch (error: any) {
      console.error("[CheckoutPage] Failed to place order:", error);
      toast.error(error?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
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
          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-6">
            <h2 className="font-display text-xl text-foreground mb-4">
              Shipping Details
            </h2>

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

          <div>
            <h2 className="font-display text-xl text-foreground mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 border-b border-border pb-6 mb-6">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex justify-between font-body text-sm"
                >
                  <span className="text-foreground">
                    {item.product.name} ({item.size}) × {item.quantity}
                  </span>
                  <span className="text-foreground">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-body text-sm mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-body text-sm mb-2">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>

            {taxRate > 0 && (
              <div className="flex justify-between font-body text-sm mb-6">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="text-foreground">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-display text-xl border-t border-border pt-4 mb-8">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
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