import { useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory as fetchProducts } from "@/services/firebase/productService";
import { getCategoryBySlug } from "@/services/firebase/categoryService";
import { motion } from "framer-motion";
import type { Product, Category } from "@/types/product";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<SortOption>("default");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [cat, products] = await Promise.all([
          getCategoryBySlug(slug),
          fetchProducts(slug),
        ]);
        setCategory(cat);
        setAllProducts(products);
      } catch (error) {
        console.error("[CategoryPage] Failed to load:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (sizeFilter) result = result.filter((p) => p.sizes.includes(sizeFilter));
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "newest": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return result;
  }, [allProducts, sort, sizeFilter, priceRange]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse font-body text-sm text-muted-foreground">
            Loading category...
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">Category not found</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-3">{category.name}</h1>
          <p className="font-body text-sm text-muted-foreground">{category.description}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-12 justify-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-secondary text-foreground font-body text-xs tracking-wide px-4 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="default">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="bg-secondary text-foreground font-body text-xs tracking-wide px-4 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Sizes</option>
            {["S", "M", "L", "XL", "One Size"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            <span>Up to</span>
            <input
              type="range"
              min={0}
              max={600}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-24 accent-foreground"
            />
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-body text-muted-foreground py-20">
            No products match your filters.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
