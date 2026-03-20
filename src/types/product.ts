// ============================================
// Product Types
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  sizes: string[];
  variants?: ProductVariant[];
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface StatusChange {
  status: OrderStatus;
  timestamp: Date;
  changedBy: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: ShippingAddress;
  status: OrderStatus;
  statusHistory: StatusChange[];
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User Types
// ============================================

export type UserRole = "admin" | "customer";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  createdAt: Date;
  lastLoginAt: Date;
}

// ============================================
// Settings Types
// ============================================

export interface AppSettings {
  siteName: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  taxRate: number;
  maintenanceMode: boolean;
  announcements: string[];
  updatedAt: Date;
}

// ============================================
// Analytics Types
// ============================================

export interface MonthlyAnalytics {
  totalOrders: number;
  totalRevenue: number;
  newUsers: number;
  productsSold: Record<string, number>;
  updatedAt: Date;
}
