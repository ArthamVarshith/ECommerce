import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { getProductById } from "@/data/products";
import { motion } from "framer-motion";

const WishlistPage = () => {
  const { wishlistIds, loading } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Wishlist</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Please log in to view your wishlist.
          </p>
          <Link
            to="/login"
            className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-foreground/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const products = wishlistIds.map((id) => getProductById(id)).filter(Boolean);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-3xl lg:text-4xl text-foreground text-center mb-12"
        >
          Your Wishlist
        </motion.h1>

        {loading ? (
          <p className="font-body text-sm text-muted-foreground text-center">Loading...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-body text-sm text-muted-foreground mb-6">Your wishlist is empty.</p>
            <Link
              to="/"
              className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-foreground/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product!.id} product={product!} index={i} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
