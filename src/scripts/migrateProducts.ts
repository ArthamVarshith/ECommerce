/**
 * Product Data Migration Script
 *
 * Migrates the static product and category data from `data/products.ts`
 * to Firestore collections. Run this once after setting up admin access.
 *
 * Usage:
 *   1. Open browser console on the running app (logged in as admin)
 *   2. Copy and paste this script
 *   3. Call: window.__migrateProducts()
 *
 * Or import and call from a temporary admin page.
 */

import { db } from "@/integrations/firebase/client";
import {
    collection,
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

// Static data from the old products.ts
const STATIC_CATEGORIES = [
    {
        name: "Women",
        description: "Refined essentials for the modern woman",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop",
        slug: "women",
        order: 1,
    },
    {
        name: "Men",
        description: "Timeless staples built for everyday",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
        slug: "men",
        order: 2,
    },
    {
        name: "Accessories",
        description: "The finishing touches that define your look",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
        slug: "accessories",
        order: 3,
    },
    {
        name: "Outerwear",
        description: "Layer up with purpose and style",
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
        slug: "outerwear",
        order: 4,
    },
];

const STATIC_PRODUCTS = [
    // Women
    { id: "w1", name: "Linen Relaxed Blazer", slug: "linen-relaxed-blazer", price: 189, originalPrice: 249, description: "A beautifully tailored linen blazer with a relaxed silhouette. Perfect for layering over dresses or pairing with trousers for an effortless look.", category: "women", images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&h=800&fit=crop", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 42, isFeatured: true, isNew: false },
    { id: "w2", name: "Silk Midi Skirt", slug: "silk-midi-skirt", price: 145, description: "Flowing silk midi skirt with an elastic waistband and subtle sheen.", category: "women", images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.6, reviewCount: 28, isNew: true, isFeatured: false },
    { id: "w3", name: "Cashmere Crew Neck", slug: "cashmere-crew-neck", price: 225, description: "Ultra-soft cashmere sweater in a classic crew neck cut.", category: "women", images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 65, isFeatured: true, isNew: false },
    { id: "w4", name: "Wide Leg Trousers", slug: "wide-leg-trousers", price: 135, description: "High-waisted wide leg trousers crafted from organic cotton twill.", category: "women", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.5, reviewCount: 33, isFeatured: false, isNew: false },
    { id: "w5", name: "Cotton Poplin Shirt", slug: "cotton-poplin-shirt", price: 98, description: "Crisp cotton poplin shirt with an oversized fit and curved hem.", category: "women", images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.7, reviewCount: 51, isNew: true, isFeatured: false },
    { id: "w6", name: "Merino Wrap Dress", slug: "merino-wrap-dress", price: 198, description: "Elegant wrap dress in fine merino wool.", category: "women", images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 19, isFeatured: false, isNew: false },

    // Men
    { id: "m1", name: "Oxford Button-Down", slug: "oxford-button-down", price: 110, description: "Classic oxford cloth button-down shirt in organic cotton.", category: "men", images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 88, isFeatured: true, isNew: false },
    { id: "m2", name: "Slim Chinos", slug: "slim-chinos", price: 95, originalPrice: 125, description: "Garment-dyed slim chinos with a comfortable stretch.", category: "men", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviewCount: 72, isFeatured: false, isNew: false },
    { id: "m3", name: "Merino Polo Shirt", slug: "merino-polo-shirt", price: 125, description: "Fine gauge merino wool polo with a refined collar.", category: "men", images: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.8, reviewCount: 45, isNew: true, isFeatured: false },
    { id: "m4", name: "Tailored Wool Trousers", slug: "tailored-wool-trousers", price: 175, description: "Impeccably tailored trousers in Italian wool.", category: "men", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop"], sizes: ["M", "L", "XL"], rating: 4.5, reviewCount: 31, isFeatured: false, isNew: false },
    { id: "m5", name: "Cotton T-Shirt", slug: "cotton-t-shirt", price: 55, description: "Heavyweight organic cotton t-shirt with a relaxed fit.", category: "men", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 120, isFeatured: true, isNew: false },
    { id: "m6", name: "Linen Shorts", slug: "linen-shorts", price: 85, description: "Relaxed linen shorts with a drawstring waist.", category: "men", images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.4, reviewCount: 26, isNew: true, isFeatured: false },

    // Accessories
    { id: "a1", name: "Leather Tote Bag", slug: "leather-tote-bag", price: 295, description: "Full-grain vegetable-tanned leather tote with interior pockets.", category: "accessories", images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.9, reviewCount: 56, isFeatured: true, isNew: false },
    { id: "a2", name: "Wool Scarf", slug: "wool-scarf", price: 75, originalPrice: 95, description: "Oversized wool scarf in a subtle herringbone pattern.", category: "accessories", images: ["https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.7, reviewCount: 38, isFeatured: false, isNew: false },
    { id: "a3", name: "Leather Belt", slug: "leather-belt", price: 85, description: "Handcrafted leather belt with a brushed brass buckle.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.6, reviewCount: 44, isFeatured: false, isNew: false },
    { id: "a4", name: "Canvas Weekender", slug: "canvas-weekender", price: 195, description: "Waxed canvas weekender bag with leather handles.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.8, reviewCount: 22, isNew: true, isFeatured: false },
    { id: "a5", name: "Silk Pocket Square", slug: "silk-pocket-square", price: 45, description: "Hand-rolled silk pocket square in seasonal prints.", category: "accessories", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop"], sizes: ["One Size"], rating: 4.5, reviewCount: 15, isFeatured: false, isNew: false },

    // Outerwear
    { id: "o1", name: "Wool Overcoat", slug: "wool-overcoat", price: 425, originalPrice: 550, description: "Double-faced wool overcoat with a clean, minimal silhouette.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.9, reviewCount: 34, isFeatured: true, isNew: false },
    { id: "o2", name: "Quilted Jacket", slug: "quilted-jacket", price: 245, description: "Lightweight quilted jacket with recycled insulation.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 29, isNew: true, isFeatured: false },
    { id: "o3", name: "Cotton Trench Coat", slug: "cotton-trench-coat", price: 325, description: "Modern interpretation of the classic trench.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L"], rating: 4.8, reviewCount: 41, isFeatured: false, isNew: false },
    { id: "o4", name: "Denim Jacket", slug: "denim-jacket", price: 175, description: "Washed organic cotton denim jacket with a boxy fit.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviewCount: 53, isFeatured: true, isNew: false },
    { id: "o5", name: "Puffer Vest", slug: "puffer-vest", price: 165, description: "Recycled down puffer vest. Lightweight warmth for layering.", category: "outerwear", images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.5, reviewCount: 18, isFeatured: false, isNew: false },
    { id: "o6", name: "Rain Parka", slug: "rain-parka", price: 285, description: "Seam-sealed waterproof parka with adjustable hood.", category: "outerwear", images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop"], sizes: ["S", "M", "L", "XL"], rating: 4.7, reviewCount: 24, isNew: true, isFeatured: false },
];

/**
 * Migrates categories and products to Firestore.
 * Preserves original IDs for backward compatibility with existing cart data.
 */
export const migrateProductsToFirestore = async (
    adminUid: string
): Promise<{ categories: number; products: number }> => {
    console.log("[Migration] Starting product data migration...");

    // Migrate categories
    let catCount = 0;
    for (const cat of STATIC_CATEGORIES) {
        const catRef = doc(collection(db, "categories"));
        await setDoc(catRef, {
            ...cat,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        catCount++;
        console.log(`[Migration] Category: ${cat.name} ✓`);
    }

    // Migrate products (use original IDs as document IDs)
    let prodCount = 0;
    for (const prod of STATIC_PRODUCTS) {
        const { id, ...productData } = prod;
        const prodRef = doc(db, "products", id);
        await setDoc(prodRef, {
            ...productData,
            stock: 50,
            inStock: true,
            isActive: true,
            tags: [productData.category],
            variants: [],
            createdBy: adminUid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        prodCount++;
        console.log(`[Migration] Product: ${prod.name} ✓`);
    }

    console.log(
        `[Migration] Complete! ${catCount} categories, ${prodCount} products migrated.`
    );

    return { categories: catCount, products: prodCount };
};
