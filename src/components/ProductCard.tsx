import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { motion } from "framer-motion";

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-body tracking-[0.15em] uppercase px-3 py-1">
              New
            </span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-warm text-warm-foreground text-[10px] font-body tracking-[0.15em] uppercase px-3 py-1">
              -{discount}%
            </span>
          )}
        </div>
        <h3 className="font-body text-sm text-foreground mb-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
