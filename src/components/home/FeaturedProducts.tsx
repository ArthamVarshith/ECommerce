import { getFeaturedProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
  const featured = getFeaturedProducts();

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
