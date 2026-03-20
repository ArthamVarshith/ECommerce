import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getProducts,
    deleteProduct,
    toggleProductStock,
} from "@/services/firebase/productService";
import type { Product } from "@/types/product";
import { toast } from "sonner";
import {
    Plus,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Search,
    Package,
} from "lucide-react";

const AdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadProducts = async () => {
        try {
            setLoading(true);
            const result = await getProducts({ pageSize: 100 });
            setProducts(result.products);
        } catch (error) {
            console.error("[AdminProducts] Failed to load:", error);
            toast.error("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (product: Product) => {
        if (!confirm(`Deactivate "${product.name}"? It will be hidden from customers.`)) return;
        try {
            await deleteProduct(product.id);
            toast.success(`"${product.name}" deactivated.`);
            await loadProducts();
        } catch (error) {
            toast.error("Failed to deactivate product.");
        }
    };

    const handleToggleStock = async (product: Product) => {
        try {
            await toggleProductStock(product.id, !product.inStock);
            toast.success(
                `"${product.name}" is now ${!product.inStock ? "in stock" : "out of stock"}.`
            );
            await loadProducts();
        } catch (error) {
            toast.error("Failed to toggle stock.");
        }
    };

    const filtered = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">
                    Loading products...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display text-white tracking-wide">
                        Products
                    </h1>
                    <p className="text-sm text-gray-500 font-body mt-1">
                        {products.length} total · {products.filter((p) => p.isActive).length}{" "}
                        active
                    </p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-body px-4 py-2.5 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#16161d] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-body placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-[#16161d] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 font-body uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3 text-left">Product</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-right">Price</th>
                                <th className="px-6 py-3 text-center">Stock</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.images[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-white/5"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-white font-body">
                                                    {product.name}
                                                </p>
                                                <p className="text-[11px] text-gray-500 font-mono">
                                                    {product.id.slice(0, 12)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-400 capitalize">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white text-right font-mono">
                                        ${product.price.toFixed(2)}
                                        {product.originalPrice && (
                                            <span className="text-gray-500 line-through ml-2">
                                                ${product.originalPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span
                                            className={`text-sm font-mono ${product.stock <= 5
                                                    ? "text-red-400"
                                                    : "text-gray-300"
                                                }`}
                                        >
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleStock(product)}
                                            className="inline-flex items-center gap-1.5 transition-colors"
                                            title={product.inStock ? "Mark out of stock" : "Mark in stock"}
                                        >
                                            {product.inStock ? (
                                                <>
                                                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                                                    <span className="text-[11px] text-emerald-400 uppercase tracking-wide">
                                                        In Stock
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="w-5 h-5 text-red-400" />
                                                    <span className="text-[11px] text-red-400 uppercase tracking-wide">
                                                        Out
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/products/${product.id}`}
                                                className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Deactivate"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-gray-500 text-sm"
                                    >
                                        {searchTerm
                                            ? "No products match your search."
                                            : "No products yet. Click 'Add Product' to create one."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
