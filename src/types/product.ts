export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}
