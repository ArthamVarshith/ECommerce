import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 lg:py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-3xl text-foreground mb-4">Your cart is empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Discover our collections and find something you love.
          </p>
          <Link
            to="/"
            className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-foreground/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                layout
                className="flex gap-4 lg:gap-6 pb-6 border-b border-border"
              >
                <Link to={`/product/${item.product.id}`} className="w-24 lg:w-32 aspect-[3/4] bg-secondary flex-shrink-0 overflow-hidden">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.product.id}`} className="font-body text-sm text-foreground hover:underline">
                        {item.product.name}
                      </Link>
                      <p className="font-body text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-sm w-8 text-center text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-body text-sm text-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-secondary p-8">
            <h2 className="font-display text-xl text-foreground mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{subtotal >= 150 ? "Free" : "$12.00"}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between font-body text-base">
                <span className="text-foreground font-medium">Total</span>
                <span className="text-foreground font-medium">
                  ${(subtotal + (subtotal >= 150 ? 0 : 12)).toFixed(2)}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-foreground/90 transition-colors text-center"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/"
              className="block text-center font-body text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
