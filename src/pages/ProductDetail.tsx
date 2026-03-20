import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { getProductById, getProductsByCategory } from "@/services/firebase/productService";
import { useCart } from "@/contexts/CartContext";
import { Star, Minus, Plus, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/types/product";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const p = await getProductById(id);
        setProduct(p);

        if (p) {
          const categoryProducts = await getProductsByCategory(p.category);
          setRelated(categoryProducts.filter((rp) => rp.id !== p.id).slice(0, 4));
        }
      } catch (error) {
        console.error("[ProductDetail] Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const wishlisted = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse font-body text-sm text-muted-foreground">
            Loading product...
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground">Product not found</h1>
          <Link to="/" className="font-body text-sm text-muted-foreground mt-4 inline-block hover:text-foreground">
            Return home
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, quantity);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16">
        {/* Breadcrumb */}
        <nav className="font-body text-xs text-muted-foreground mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-foreground capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-[3/4] bg-secondary overflow-hidden mb-4">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-110"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 bg-secondary overflow-hidden border-2 transition-colors ${activeImage === i ? "border-foreground" : "border-transparent"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            {product.isNew && (
              <span className="font-body text-[10px] tracking-[0.2em] uppercase text-warm mb-3">New Arrival</span>
            )}
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(product.rating) ? "fill-warm text-warm" : "text-border"}
                  />
                ))}
              </div>
              <span className="font-body text-xs text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-2xl text-foreground">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="font-body text-lg text-muted-foreground line-through">${product.originalPrice}</span>
                  <span className="font-body text-xs text-warm">-{discount}%</span>
                </>
              )}
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size */}
            <div className="mb-8">
              <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`font-body text-sm px-5 py-2.5 border transition-colors ${selectedSize === size
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="font-body text-xs text-warm mt-2">Please select a size</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="font-body text-sm w-12 text-center text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  disabled={quantity >= 20}
                  className="p-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 border transition-colors ${wishlisted
                  ? "border-foreground text-foreground bg-foreground/5"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                  }`}
              >
                <Heart size={18} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            {/* Details */}
            <div className="mt-12 pt-8 border-t border-border space-y-4">
              <div className="font-body text-xs text-muted-foreground">
                <span className="tracking-[0.15em] uppercase">Free shipping</span> on orders over $150
              </div>
              <div className="font-body text-xs text-muted-foreground">
                <span className="tracking-[0.15em] uppercase">Easy returns</span> within 30 days
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <h2 className="font-display text-2xl lg:text-3xl text-foreground text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
