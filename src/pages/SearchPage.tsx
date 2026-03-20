import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { getActiveProducts } from "@/services/firebase/productService";
import type { Product } from "@/types/product";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sort, setSort] = useState("default");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const products = await getActiveProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("[SearchPage] Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    let filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [query, sort, allProducts]);

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-2">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          {loading
            ? "Searching..."
            : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
        </p>

        {results.length > 0 && (
          <div className="flex justify-end mb-8">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-secondary text-foreground font-body text-xs tracking-wide px-4 py-2.5 border border-border focus:outline-none"
            >
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {results.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-muted-foreground">No products found. Try a different search term.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
