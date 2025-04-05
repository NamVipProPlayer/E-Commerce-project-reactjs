import { useRef } from "react";
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@radix-ui/react-dialog";
import { Loader2, X, Camera, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import styles from "./stylesProduct.module.scss";

import { useQueryClient } from "@tanstack/react-query";
import shoesProductService from "@/apis/shoesProductService.js";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().min(1, "Brand is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be positive"),
    stock: z.number().min(0, "Stock must be positive"),
    sizes: z.string().min(1, "At least one size is required"),
    colors: z.string().min(1, "At least one color is required"),
    fSrc: z.string().url("Must be a valid URL"),
    sSrc: z.string().url("Must be a valid URL"),
    sale: z
        .number()
        .min(0, "Sale must be non-negative")
        .max(100, "Sale cannot exceed 100%")
        .optional(),
    bestSeller: z.boolean().optional()
});

export function ProductForm({ open, onOpenChange, onSubmit, isSubmitting }) {
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const querryClientImport = useQueryClient();

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            brand: "Nike",
            category: "",
            description: "",
            price: undefined,
            stock: undefined,
            sizes: "", // Change from array to string
            colors: "", // Change from array to string
            fSrc: "",
            sSrc: "",
            sale: 0,
            bestSeller: false
        }
    });

    // Submit handling
    const handleSubmit = async () => {
        try {
            const formData = form.getValues(); // Get form data

            // Function to format sizes and colors properly
            const formatInput = (input) =>
                typeof input === "string"
                    ? input
                          .split(/[,]+/) // Split by commas
                          .map((item) => item.trim())
                          .filter((item) => item !== "")
                    : Array.isArray(input)
                    ? input
                    : [];

            // Format the sizes as numbers and colors as strings
            const formattedData = {
                ...formData,
                sizes: formatInput(formData.sizes).map((size) => {
                    // Try to convert to number, but if it fails, keep as string
                    const sizeNum = Number(size);
                    return !isNaN(sizeNum) ? sizeNum : size;
                }),
                colors: formatInput(formData.colors),
                sale: formData.sale || 0, // Ensure sale is at least 0
                bestSeller: !!formData.bestSeller // Ensure bestSeller is boolean
            };

            console.log("Sending formatted data:", formattedData);

            const response = await shoesProductService.createShoeProduct(
                formattedData
            );
            await querryClientImport.invalidateQueries({
                queryFn: shoesProductService.getAllShoesProducts()
            });
            toast("Add product successful!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce
            });
            onOpenChange(false);
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error(
                "Failed to add product: " + (error.message || "Unknown error")
            );
        }
    };

    //upload image before store data
    const handleImageUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 1️⃣ Get timestamp and signature from your backend
            const signatureResponse = await fetch(
                "https://backendimg-rmha.onrender.com/cloudinary-signature"
            );
            const { timestamp, signature } = await signatureResponse.json();

            if (!timestamp || !signature) {
                throw new Error("Failed to get signature from backend");
            }

            // 2️⃣ Prepare form data for Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);

            // 3️⃣ Send image upload request to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${
                    import.meta.env.VITE_CLOUDINARY_NAME
                }/image/upload`,
                { method: "POST", body: formData }
            );

            const data = await response.json();

            if (data.secure_url) {
                console.log("Uploaded image:", data.secure_url);
                form.setValue(field, data.secure_url);
            } else {
                throw new Error(data.error?.message || "Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    // Reference for frequently used brands and categories
    const popularBrands = ["Nike", "Adidas", "Puma", "New Balance", "Converse"];
    const popularCategories = [
        "Running",
        "Basketball",
        "Casual",
        "Formal",
        "Sports"
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <ToastContainer />
            <DialogOverlay className={styles.overlay} />
            <DialogContent className={styles.modal}>
                <div className={styles.modalHeader}>
                    <DialogTitle className={styles.modalTitle}>
                        Add New Shoe Product
                    </DialogTitle>
                    <DialogClose className={styles.closeButton}>
                        <X size={18} />
                    </DialogClose>
                </div>

                <DialogDescription className={styles.modalDescription}>
                    Complete all fields below to add a new shoe to the catalog.
                </DialogDescription>

                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className={styles.form}
                >
                    <div className={styles.formLayout}>
                        {/* Left Column - Basic Info */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>
                                Basic Information
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="name">
                                    Product Name{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="name"
                                    {...form.register("name")}
                                    className={`${styles.input} ${
                                        form.formState.errors.name
                                            ? styles.errorInput
                                            : ""
                                    }`}
                                    placeholder="Enter product name"
                                />
                                {form.formState.errors.name && (
                                    <span className={styles.errorText}>
                                        {form.formState.errors.name.message}
                                    </span>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label
                                        className={styles.label}
                                        htmlFor="brand"
                                    >
                                        Brand{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="brand"
                                        {...form.register("brand")}
                                        className={`${styles.input} ${
                                            form.formState.errors.brand
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="Select brand"
                                        list="brand-options"
                                    />
                                    <datalist id="brand-options">
                                        {popularBrands.map((brand) => (
                                            <option key={brand} value={brand} />
                                        ))}
                                    </datalist>
                                    {form.formState.errors.brand && (
                                        <span className={styles.errorText}>
                                            {
                                                form.formState.errors.brand
                                                    .message
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label
                                        className={styles.label}
                                        htmlFor="category"
                                    >
                                        Category{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="category"
                                        {...form.register("category")}
                                        className={`${styles.input} ${
                                            form.formState.errors.category
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="Select category"
                                        list="category-options"
                                    />
                                    <datalist id="category-options">
                                        {popularCategories.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            />
                                        ))}
                                    </datalist>
                                    {form.formState.errors.category && (
                                        <span className={styles.errorText}>
                                            {
                                                form.formState.errors.category
                                                    .message
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label
                                    className={styles.label}
                                    htmlFor="description"
                                >
                                    Description{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <textarea
                                    id="description"
                                    {...form.register("description")}
                                    className={`${styles.textarea} ${
                                        form.formState.errors.description
                                            ? styles.errorInput
                                            : ""
                                    }`}
                                    placeholder="Enter product description"
                                    rows={4}
                                />
                                {form.formState.errors.description && (
                                    <span className={styles.errorText}>
                                        {
                                            form.formState.errors.description
                                                .message
                                        }
                                    </span>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label
                                        className={styles.label}
                                        htmlFor="price"
                                    >
                                        Price ($){" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        {...form.register("price", {
                                            valueAsNumber: true
                                        })}
                                        className={`${styles.input} ${
                                            form.formState.errors.price
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {form.formState.errors.price && (
                                        <span className={styles.errorText}>
                                            {
                                                form.formState.errors.price
                                                    .message
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label
                                        className={styles.label}
                                        htmlFor="stock"
                                    >
                                        Stock{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="stock"
                                        type="number"
                                        {...form.register("stock", {
                                            valueAsNumber: true
                                        })}
                                        className={`${styles.input} ${
                                            form.formState.errors.stock
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="0"
                                    />
                                    {form.formState.errors.stock && (
                                        <span className={styles.errorText}>
                                            {
                                                form.formState.errors.stock
                                                    .message
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* New Sale and Best Seller Fields */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label
                                        className={styles.label}
                                        htmlFor="sale"
                                    >
                                        Sale Discount (%)
                                    </label>
                                    <input
                                        id="sale"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        {...form.register("sale", {
                                            valueAsNumber: true
                                        })}
                                        className={`${styles.input} ${
                                            form.formState.errors.sale
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="0"
                                    />
                                    {form.formState.errors.sale && (
                                        <span className={styles.errorText}>
                                            {form.formState.errors.sale.message}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <div className={styles.checkboxContainer}>
                                        <input
                                            id="bestSeller"
                                            type="checkbox"
                                            {...form.register("bestSeller")}
                                            className={styles.checkbox}
                                        />
                                        <label
                                            className={styles.checkboxLabel}
                                            htmlFor="bestSeller"
                                        >
                                            Mark as Best Seller
                                        </label>
                                    </div>
                                    {form.formState.errors.bestSeller && (
                                        <span className={styles.errorText}>
                                            {
                                                form.formState.errors.bestSeller
                                                    .message
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Options & Images */}
                        <div className={styles.formColumn}>
                            <h3 className={styles.sectionTitle}>
                                Product Options & Images
                            </h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="sizes">
                                    Available Sizes{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="sizes"
                                    type="text"
                                    {...form.register("sizes")}
                                    className={`${styles.input} ${
                                        form.formState.errors.sizes
                                            ? styles.errorInput
                                            : ""
                                    }`}
                                    placeholder="Comma-separated sizes (e.g., 7, 8, 9)"
                                />
                                <span className={styles.helpText}>
                                    Enter sizes separated by commas (e.g.,
                                    40,41,42,43)
                                </span>
                                {form.formState.errors.sizes && (
                                    <span className={styles.errorText}>
                                        {form.formState.errors.sizes.message}
                                    </span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label
                                    className={styles.label}
                                    htmlFor="colors"
                                >
                                    Colors{" "}
                                    <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.colorInputWrapper}>
                                    <input
                                        id="colors"
                                        type="text"
                                        {...form.register("colors")}
                                        className={`${styles.input} ${
                                            form.formState.errors.colors
                                                ? styles.errorInput
                                                : ""
                                        }`}
                                        placeholder="Comma-separated hex colors (e.g., #000000, #FF5733)"
                                    />
                                    <input
                                        type="color"
                                        className={styles.colorPicker}
                                        onChange={(e) => {
                                            const currentColors =
                                                form.getValues("colors");
                                            const colorArray =
                                                typeof currentColors ===
                                                "string"
                                                    ? currentColors
                                                          .split(",")
                                                          .map((c) => c.trim())
                                                    : Array.isArray(
                                                          currentColors
                                                      )
                                                    ? currentColors
                                                    : [];

                                            const newColor = e.target.value;
                                            if (
                                                !colorArray.includes(newColor)
                                            ) {
                                                const newColors = [
                                                    ...colorArray,
                                                    newColor
                                                ].filter(Boolean);
                                                form.setValue(
                                                    "colors",
                                                    newColors.join(", ")
                                                );
                                            }
                                        }}
                                    />
                                </div>
                                <span className={styles.helpText}>
                                    Enter colors separated by commas (e.g., Red,
                                    Summit White, Black)
                                </span>
                                {form.formState.errors.colors && (
                                    <span className={styles.errorText}>
                                        {form.formState.errors.colors.message}
                                    </span>
                                )}
                            </div>

                            <div className={styles.imageUploads}>
                                <div className={styles.imageUploadGroup}>
                                    <label className={styles.label}>
                                        Front Image{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <div
                                        className={styles.uploadContainer}
                                        onClick={() =>
                                            fileInputRef1.current?.click()
                                        }
                                    >
                                        {form.watch("fSrc") ? (
                                            <div
                                                className={
                                                    styles.previewContainer
                                                }
                                            >
                                                <img
                                                    src={form.watch("fSrc")}
                                                    alt="Front view"
                                                    className={
                                                        styles.imagePreview
                                                    }
                                                />
                                                <div
                                                    className={
                                                        styles.imageOverlay
                                                    }
                                                >
                                                    <Camera size={20} />
                                                    <span>Change image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.uploadPrompt}
                                            >
                                                <Upload size={24} />
                                                <span>Upload front view</span>
                                                <small>Click to browse</small>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef1}
                                        onChange={(e) =>
                                            handleImageUpload(e, "fSrc")
                                        }
                                        accept="image/*"
                                        className={styles.hiddenInput}
                                    />
                                    <input
                                        type="hidden"
                                        {...form.register("fSrc")}
                                    />
                                    {form.formState.errors.fSrc && (
                                        <span className={styles.errorText}>
                                            {form.formState.errors.fSrc.message}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.imageUploadGroup}>
                                    <label className={styles.label}>
                                        Side Image{" "}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <div
                                        className={styles.uploadContainer}
                                        onClick={() =>
                                            fileInputRef2.current?.click()
                                        }
                                    >
                                        {form.watch("sSrc") ? (
                                            <div
                                                className={
                                                    styles.previewContainer
                                                }
                                            >
                                                <img
                                                    src={form.watch("sSrc")}
                                                    alt="Side view"
                                                    className={
                                                        styles.imagePreview
                                                    }
                                                />
                                                <div
                                                    className={
                                                        styles.imageOverlay
                                                    }
                                                >
                                                    <Camera size={20} />
                                                    <span>Change image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.uploadPrompt}
                                            >
                                                <Upload size={24} />
                                                <span>Upload side view</span>
                                                <small>Click to browse</small>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef2}
                                        onChange={(e) =>
                                            handleImageUpload(e, "sSrc")
                                        }
                                        accept="image/*"
                                        className={styles.hiddenInput}
                                    />
                                    <input
                                        type="hidden"
                                        {...form.register("sSrc")}
                                    />
                                    {form.formState.errors.sSrc && (
                                        <span className={styles.errorText}>
                                            {form.formState.errors.sSrc.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin mr-2"
                                    />
                                    Adding...
                                </>
                            ) : (
                                "Add Product"
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
