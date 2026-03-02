import { Product, Category } from "@/types/product";

export const categories: Category[] = [
  {
    id: "1",
    name: "Women",
    description: "Refined essentials for the modern woman",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop",
    slug: "women",
  },
  {
    id: "2",
    name: "Men",
    description: "Timeless staples built for everyday",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
    slug: "men",
  },
  {
    id: "3",
    name: "Accessories",
    description: "The finishing touches that define your look",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
    slug: "accessories",
  },
  {
    id: "4",
    name: "Outerwear",
    description: "Layer up with purpose and style",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
    slug: "outerwear",
  },
];

export const products: Product[] = [
  // Women
  { id: "w1", name: "Linen Relaxed Blazer", price: 189, originalPrice: 249, description: "A beautifully tailored linen blazer with a relaxed silhouette. Perfect for layering over dresses or pairing with trousers for an effortless look.", category: "women", images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=800&fit=crop", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 42, isFeatured: true },
  { id: "w2", name: "Silk Midi Skirt", price: 145, description: "Flowing silk midi skirt with an elastic waistband and subtle sheen. A versatile piece that transitions from day to evening.", category: "women", images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.6, reviewCount: 28, isNew: true },
  { id: "w3", name: "Cashmere Crew Neck", price: 225, description: "Ultra-soft cashmere sweater in a classic crew neck cut. Lightweight enough for layering, warm enough for chilly evenings.", category: "women", images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 65, isFeatured: true },
  { id: "w4", name: "Wide Leg Trousers", price: 135, description: "High-waisted wide leg trousers crafted from organic cotton twill. A flattering, comfortable silhouette for any occasion.", category: "women", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.5, reviewCount: 33 },
  { id: "w5", name: "Cotton Poplin Shirt", price: 98, description: "Crisp cotton poplin shirt with an oversized fit and curved hem. Essential for building a timeless wardrobe.", category: "women", images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.7, reviewCount: 51, isNew: true },
  { id: "w6", name: "Merino Wrap Dress", price: 198, description: "Elegant wrap dress in fine merino wool. Flattering drape with adjustable tie waist.", category: "women", images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 19 },

  // Men
  { id: "m1", name: "Oxford Button-Down", price: 110, description: "Classic oxford cloth button-down shirt in organic cotton. The definitive smart-casual essential.", category: "men", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 88, isFeatured: true },
  { id: "m2", name: "Slim Chinos", price: 95, originalPrice: 125, description: "Garment-dyed slim chinos with a comfortable stretch. Available in seasonless neutral tones.", category: "men", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviewCount: 72 },
  { id: "m3", name: "Merino Polo Shirt", price: 125, description: "Fine gauge merino wool polo with a refined collar. Breathable and temperature-regulating for year-round comfort.", category: "men", images: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 45, isNew: true },
  { id: "m4", name: "Tailored Wool Trousers", price: 175, description: "Impeccably tailored trousers in Italian wool. A foundation piece for any considered wardrobe.", category: "men", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["M", "L", "XL"], rating: 4.5, reviewCount: 31 },
  { id: "m5", name: "Cotton T-Shirt", price: 55, description: "Heavyweight organic cotton t-shirt with a relaxed fit. Triple-stitched for lasting quality.", category: "men", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 120, isFeatured: true },
  { id: "m6", name: "Linen Shorts", price: 85, description: "Relaxed linen shorts with a drawstring waist. The perfect warm-weather essential.", category: "men", images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.4, reviewCount: 26, isNew: true },

  // Accessories
  { id: "a1", name: "Leather Tote Bag", price: 295, description: "Full-grain vegetable-tanned leather tote with interior pockets. Ages beautifully with use.", category: "accessories", images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.9, reviewCount: 56, isFeatured: true },
  { id: "a2", name: "Wool Scarf", price: 75, originalPrice: 95, description: "Oversized wool scarf in a subtle herringbone pattern. Soft, warm, and endlessly versatile.", category: "accessories", images: ["https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.7, reviewCount: 38 },
  { id: "a3", name: "Leather Belt", price: 85, description: "Handcrafted leather belt with a brushed brass buckle. Made to last a lifetime.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.6, reviewCount: 44 },
  { id: "a4", name: "Canvas Weekender", price: 195, description: "Waxed canvas weekender bag with leather handles. Spacious enough for a weekend getaway.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.8, reviewCount: 22, isNew: true },
  { id: "a5", name: "Silk Pocket Square", price: 45, description: "Hand-rolled silk pocket square in seasonal prints. The perfect finishing touch.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.5, reviewCount: 15 },

  // Outerwear
  { id: "o1", name: "Wool Overcoat", price: 425, originalPrice: 550, description: "Double-faced wool overcoat with a clean, minimal silhouette. An investment piece for the colder months.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 34, isFeatured: true },
  { id: "o2", name: "Quilted Jacket", price: 245, description: "Lightweight quilted jacket with recycled insulation. Water-resistant shell for unpredictable weather.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 29, isNew: true },
  { id: "o3", name: "Cotton Trench Coat", price: 325, description: "Modern interpretation of the classic trench. Water-repellent organic cotton with a relaxed fit.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.8, reviewCount: 41 },
  { id: "o4", name: "Denim Jacket", price: 175, description: "Washed organic cotton denim jacket with a boxy fit. A wardrobe staple that improves with age.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviewCount: 53, isFeatured: true },
  { id: "o5", name: "Puffer Vest", price: 165, description: "Recycled down puffer vest. Lightweight warmth for layering on crisp mornings.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.5, reviewCount: 18 },
  { id: "o6", name: "Rain Parka", price: 285, description: "Seam-sealed waterproof parka with adjustable hood. Engineered for serious weather protection.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 24, isNew: true },
];

export const getProductsByCategory = (categorySlug: string) =>
  products.filter((p) => p.category === categorySlug);

export const getFeaturedProducts = () =>
  products.filter((p) => p.isFeatured);

export const getNewArrivals = () =>
  products.filter((p) => p.isNew);

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);
