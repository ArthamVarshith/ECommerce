import { useState, useEffect } from "react";
import { getFeaturedProducts } from "@/services/firebase/productService";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import type { Product } from "@/types/product";

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeatured(products);
      } catch (error) {
        console.error("[FeaturedProducts] Failed to load:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="animate-pulse font-body text-sm text-muted-foreground">
            Loading featured products...
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-3">Featured Pieces</h2>
          <p className="font-body text-sm text-muted-foreground">Our most loved styles, curated for you</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.slice(0, 8).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
