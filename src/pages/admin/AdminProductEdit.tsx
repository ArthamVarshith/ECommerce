import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    createProduct,
    updateProduct,
    getProductById,
} from "@/services/firebase/productService";
import { getAllCategories } from "@/services/firebase/categoryService";
import { uploadProductImage } from "@/services/firebase/storageService";
import type { Product, Category, ProductVariant } from "@/types/product";
import { toast } from "sonner";
import { Save, ArrowLeft, Upload, Plus, X } from "lucide-react";

const AdminProductEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isNew = !id || id === "new";

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        category: "",
        price: 0,
        originalPrice: 0,
        sizes: ["S", "M", "L", "XL"],
        stock: 50,
        inStock: true,
        isNew: false,
        isFeatured: false,
        isActive: true,
        tags: [] as string[],
        rating: 0,
        reviewCount: 0,
        images: [] as string[],
        variants: [] as ProductVariant[],
    });

    useEffect(() => {
        const load = async () => {
            try {
                const cats = await getAllCategories();
                setCategories(cats);

                if (!isNew && id) {
                    const product = await getProductById(id);
                    if (product) {
                        setForm({
                            name: product.name,
                            slug: product.slug,
                            description: product.description,
                            category: product.category,
                            price: product.price,
                            originalPrice: product.originalPrice || 0,
                            sizes: product.sizes,
                            stock: product.stock,
                            inStock: product.inStock,
                            isNew: product.isNew || false,
                            isFeatured: product.isFeatured || false,
                            isActive: product.isActive,
                            tags: product.tags,
                            rating: product.rating,
                            reviewCount: product.reviewCount,
                            images: product.images,
                            variants: product.variants || [],
                        });
                    }
                }
            } catch (error) {
                console.error("[AdminProductEdit] Failed to load:", error);
                toast.error("Failed to load product data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isNew]);

    const generateSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? parseFloat(value) || 0
                        : value,
        }));

        // Auto-generate slug from name
        if (name === "name") {
            setForm((prev) => ({ ...prev, slug: generateSlug(value) }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const addVariant = () => {
        setForm((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                { name: "", sku: "", price: prev.price, stock: 0 },
            ],
        }));
    };

    const updateVariant = (index: number, field: string, value: string | number) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((v, i) =>
                i === index ? { ...v, [field]: value } : v
            ),
        }));
    };

    const removeVariant = (index: number) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            let images = [...form.images];

            // Upload new images
            const tempId = id || "temp-" + Date.now();
            for (let i = 0; i < imageFiles.length; i++) {
                const url = await uploadProductImage(tempId, imageFiles[i], images.length + i);
                images.push(url);
            }

            const productData = {
                ...form,
                images,
                createdBy: user.uid,
            };

            if (isNew) {
                const newId = await createProduct(productData as any, user.uid);
                toast.success("Product created successfully!");
                navigate(`/admin/products/${newId}`);
            } else if (id) {
                await updateProduct(id, productData);
                toast.success("Product updated successfully!");
            }
        } catch (error) {
            console.error("[AdminProductEdit] Failed to save:", error);
            toast.error("Failed to save product. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">
                    Loading product...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/admin/products")}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-display text-white tracking-wide">
                        {isNew ? "Add Product" : "Edit Product"}
                    </h1>
                    <p className="text-sm text-gray-500 font-body mt-1">
                        {isNew
                            ? "Create a new product for your store"
                            : `Editing: ${form.name}`}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <Section title="Basic Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Product Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Slug"
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="auto-generated"
                        />
                    </div>
                    <TextAreaField
                        label="Description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-body mb-1.5 block">
                                Category
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-purple-500/50"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <InputField
                            label="Tags (comma-separated)"
                            name="tags"
                            value={form.tags.join(", ")}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                }))
                            }
                            placeholder="e.g. summer, sale, new"
                        />
                    </div>
                </Section>

                {/* Pricing */}
                <Section title="Pricing & Inventory">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                            label="Price ($)"
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                            required
                        />
                        <InputField
                            label="Original Price ($)"
                            name="originalPrice"
                            type="number"
                            value={form.originalPrice}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                            placeholder="For sale display"
                        />
                        <InputField
                            label="Stock"
                            name="stock"
                            type="number"
                            value={form.stock}
                            onChange={handleChange}
                            min={0}
                            required
                        />
                    </div>
                    <InputField
                        label="Sizes (comma-separated)"
                        name="sizes"
                        value={form.sizes.join(", ")}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            }))
                        }
                        placeholder="S, M, L, XL"
                    />
                </Section>

                {/* Variants */}
                <Section title="Variants">
                    {form.variants.map((variant, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-4 gap-3 items-end bg-white/[0.02] rounded-lg p-3"
                        >
                            <InputField
                                label="Name"
                                value={variant.name}
                                onChange={(e) => updateVariant(i, "name", e.target.value)}
                                placeholder="e.g. Red"
                            />
                            <InputField
                                label="SKU"
                                value={variant.sku}
                                onChange={(e) => updateVariant(i, "sku", e.target.value)}
                            />
                            <InputField
                                label="Price"
                                type="number"
                                value={variant.price}
                                onChange={(e) =>
                                    updateVariant(i, "price", parseFloat(e.target.value) || 0)
                                }
                            />
                            <div className="flex items-center gap-2">
                                <InputField
                                    label="Stock"
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) =>
                                        updateVariant(i, "stock", parseInt(e.target.value) || 0)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => removeVariant(i)}
                                    className="p-2 text-red-400 hover:text-red-300 mt-5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addVariant}
                        className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-body mt-2"
                    >
                        <Plus className="w-4 h-4" /> Add Variant
                    </button>
                </Section>

                {/* Images */}
                <Section title="Images">
                    <div className="flex flex-wrap gap-3 mb-3">
                        {form.images.map((img, i) => (
                            <div key={i} className="relative group">
                                <img
                                    src={img}
                                    alt={`Product ${i}`}
                                    className="w-20 h-20 rounded-lg object-cover border border-white/10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((prev) => ({
                                            ...prev,
                                            images: prev.images.filter((_, idx) => idx !== i),
                                        }))
                                    }
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-dashed border-white/20 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-white hover:border-purple-500/50 transition-all">
                        <Upload className="w-4 h-4" />
                        Upload Images
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                    {imageFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            {imageFiles.length} file(s) ready to upload
                        </p>
                    )}
                </Section>

                {/* Flags */}
                <Section title="Visibility & Flags">
                    <div className="flex flex-wrap gap-6">
                        <CheckboxField
                            label="Active (visible to customers)"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                        />
                        <CheckboxField
                            label="In Stock"
                            name="inStock"
                            checked={form.inStock}
                            onChange={handleChange}
                        />
                        <CheckboxField
                            label="New Arrival"
                            name="isNew"
                            checked={form.isNew}
                            onChange={handleChange}
                        />
                        <CheckboxField
                            label="Featured"
                            name="isFeatured"
                            checked={form.isFeatured}
                            onChange={handleChange}
                        />
                    </div>
                </Section>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-body px-6 py-2.5 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                        className="text-sm text-gray-400 hover:text-white font-body"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

// ============================================
// Reusable form components
// ============================================

const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="bg-[#16161d] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-display text-white">{title}</h2>
        {children}
    </div>
);

const InputField = ({
    label,
    name,
    ...rest
}: {
    label: string;
    name?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider font-body mb-1.5 block">
            {label}
        </label>
        <input
            name={name}
            {...rest}
            className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
    </div>
);

const TextAreaField = ({
    label,
    name,
    ...rest
}: {
    label: string;
    name?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider font-body mb-1.5 block">
            {label}
        </label>
        <textarea
            name={name}
            {...rest}
            className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
        />
    </div>
);

const CheckboxField = ({
    label,
    name,
    checked,
    onChange,
}: {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer font-body">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 rounded border-white/20 bg-[#0f0f12] text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
        />
        {label}
    </label>
);

export default AdminProductEdit;
