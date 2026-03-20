import type { OrderStatus } from "@/types/product";

/**
 * Order status configuration for display and transitions.
 */
export const ORDER_STATUSES: {
    value: OrderStatus;
    label: string;
    color: string;
}[] = [
        { value: "pending", label: "Pending", color: "bg-yellow-500" },
        { value: "confirmed", label: "Confirmed", color: "bg-blue-500" },
        { value: "processing", label: "Processing", color: "bg-indigo-500" },
        { value: "shipped", label: "Shipped", color: "bg-purple-500" },
        { value: "delivered", label: "Delivered", color: "bg-green-500" },
        { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
    ];

/** Valid status transitions from each state */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

/** User roles */
export const USER_ROLES = ["admin", "customer"] as const;

/** Maximum image upload size in bytes (5 MB) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

/** Products per page in admin list */
export const ADMIN_PAGE_SIZE = 20;

/** Orders per page in admin list */
export const ADMIN_ORDERS_PAGE_SIZE = 25;
