import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getActiveCategories } from "@/services/firebase/categoryService";
import { motion } from "framer-motion";
import type { Category } from "@/types/product";

const CategoryShowcase = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await getActiveCategories();
        setCategories(cats);
      } catch (error) {
        console.error("[CategoryShowcase] Failed to load:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="animate-pulse font-body text-sm text-muted-foreground">
            Loading categories...
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl lg:text-4xl text-center mb-16 text-foreground"
        >
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/category/${cat.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors" />
                </div>
                <h3 className="font-display text-lg text-foreground">{cat.name}</h3>
                <p className="font-body text-xs text-muted-foreground mt-1">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
