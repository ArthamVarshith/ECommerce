import { storage } from "@/integrations/firebase/client";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

/**
 * Validates a file before upload.
 * Throws descriptive errors if validation fails.
 */
const validateImageFile = (file: File): void => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(
            `Invalid file type "${file.type}". Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
        );
    }
    if (file.size > MAX_IMAGE_SIZE) {
        const maxMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
        const fileMB = (file.size / (1024 * 1024)).toFixed(1);
        throw new Error(
            `File too large (${fileMB} MB). Maximum size is ${maxMB} MB.`
        );
    }
};

/**
 * Upload an image to Firebase Storage.
 *
 * @param file - The File object to upload
 * @param path - Storage path, e.g. "products/{productId}/main.webp"
 * @returns The public download URL
 */
export const uploadImage = async (
    file: File,
    path: string
): Promise<string> => {
    validateImageFile(file);

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });
    return getDownloadURL(snapshot.ref);
};

/**
 * Delete an image from Firebase Storage.
 *
 * @param path - Storage path of the file to delete
 */
export const deleteImage = async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    try {
        await deleteObject(storageRef);
    } catch (error: any) {
        // If the file doesn't exist, silently ignore
        if (error.code !== "storage/object-not-found") {
            throw error;
        }
    }
};

/**
 * Upload a product image and return its download URL.
 *
 * @param productId - The product's Firestore document ID
 * @param file - The image file
 * @param index - Image index (0 = main, 1+ = gallery)
 * @returns The public download URL
 */
export const uploadProductImage = async (
    productId: string,
    file: File,
    index: number = 0
): Promise<string> => {
    const ext = file.name.split(".").pop() || "webp";
    const fileName = index === 0 ? `main.${ext}` : `gallery-${index}.${ext}`;
    return uploadImage(file, `products/${productId}/${fileName}`);
};

/**
 * Upload a category cover image.
 */
export const uploadCategoryImage = async (
    categoryId: string,
    file: File
): Promise<string> => {
    const ext = file.name.split(".").pop() || "webp";
    return uploadImage(file, `categories/${categoryId}/cover.${ext}`);
};
