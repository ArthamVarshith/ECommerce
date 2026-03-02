import { getNewArrivals } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const NewArrivals = () => {
  const newProducts = getNewArrivals();

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-3">New Arrivals</h2>
          <p className="font-body text-sm text-muted-foreground">Fresh additions to explore this season</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
