import { useRef, useState, useEffect } from "react";
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@radix-ui/react-dialog";
import { Loader2, X, Camera, Upload, Save, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import styles from "./stylesProduct.module.scss";
import { useQueryClient } from "@tanstack/react-query";
import shoesProductService from "@/apis/shoesProductService.js";

// Current date time and user constants
const CURRENT_DATETIME = "2025-03-17 13:45:46";
const CURRENT_USER = "NamProPlayer20";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().min(1, "Brand is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    price: z.number().min(0, "Price must be positive"),
    stock: z.number().min(0, "Stock must be positive"),
    sizes: z
        .array(z.number().min(1, "Size must be valid"))
        .nonempty("At least one size is required"),
    colors: z
        .array(
            z
                .string()
                .regex(
                    /^#?[0-9a-fA-F]{3,6}$/,
                    "Color must be a valid name or hex code"
                )
        )
        .nonempty("At least one color is required"),
    fSrc: z.string().url("Must be a valid URL"),
    sSrc: z.string().url("Must be a valid URL"),
    sale: z
        .number()
        .min(0, "Sale must be non-negative")
        .max(100, "Sale cannot exceed 100%")
        .optional(),
    bestSeller: z.boolean().optional()
});

export function ProductFormUpdate({
    open,
    onOpenChange,
    onUpdate,
    isSubmitting,
    product // Existing product data
}) {
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Format arrays for display
    const formatSizesForForm = (sizes) => {
        if (Array.isArray(sizes)) {
            return sizes;
        } else if (typeof sizes === "string") {
            return sizes
                .split(/[\s,]+/)
                .map((s) => s.trim())
                .filter((s) => s !== "")
                .map(Number);
        }
        return [];
    };

    const formatColorsForForm = (colors) => {
        if (Array.isArray(colors)) {
            return colors;
        } else if (typeof colors === "string") {
            return colors
                .split(/[\s,]+/)
                .map((c) => c.trim())
                .filter((c) => c !== "");
        }
        return [];
    };

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            brand: "",
            category: "",
            description: "",
            price: undefined,
            stock: undefined,
            sizes: [],
            colors: [],
            fSrc: "",
            sSrc: "",
            sale: 0, // Default sale to 0%
            bestSeller: false // Default bestSeller to false
        }
    });

    // Initialize form with product data when available
    useEffect(() => {
        if (product && open) {
            form.reset({
                name: product.name || "",
                brand: product.brand || "",
                category: product.category || "",
                description: product.description || "",
                price:
                    typeof product.price === "number"
                        ? product.price
                        : undefined,
                stock:
                    typeof product.stock === "number"
                        ? product.stock
                        : undefined,
                sizes: formatSizesForForm(product.sizes),
                colors: formatColorsForForm(product.colors),
                fSrc: product.fSrc || "",
                sSrc: product.sSrc || "",
                sale: typeof product.sale === "number" ? product.sale : 0,
                bestSeller: !!product.bestSeller
            });
        }
    }, [product, form, open]);

    // Submit handling
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const formData = form.getValues(); // Get form data

            // Function to format sizes and colors properly
            const formatInput = (input) =>
                typeof input === "string"
                    ? input
                          .split(/[\s,]+/) // Split by spaces or commas
                          .map((item) => item.trim())
                          .filter((item) => item !== "")
                    : Array.isArray(input)
                    ? input
                    : [];

            // Format the sizes as numbers and colors as strings
            const formattedData = {
                ...formData,
                sizes: formatInput(formData.sizes).map((size) => Number(size)),
                colors: formatInput(formData.colors),
                sale: formData.sale || 0, // Ensure sale is at least 0
                bestSeller: !!formData.bestSeller, // Ensure bestSeller is a boolean
                updatedAt: CURRENT_DATETIME,
                updatedBy: CURRENT_USER
            };

            console.log("Updating product with data:", formattedData);

            const response = await shoesProductService.updateShoeProduct(
                product.id || product._id,
                formattedData
            );

            await queryClient.invalidateQueries({
                queryKey: ["shoes"]
            });

            toast.success("Product updated successfully!", {
                position: "bottom-right",
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
            if (typeof onUpdate === "function") {
                onUpdate(response);
            }

            console.log("Update response:", response);
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error(`Failed to update product: ${error.message}`, {
                position: "bottom-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    //upload image before store data
    const handleImageUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Show loading state
            setIsLoading(true);

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
                toast.info("Image uploaded successfully", {
                    position: "bottom-right",
                    autoClose: 1500
                });
            } else {
                throw new Error(data.error?.message || "Image upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(`Image upload failed: ${error.message}`, {
                position: "bottom-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Reference for frequently used brands and categories
    const popularBrands = [
        "Nike",
        "Adidas",
        "Puma",
        "New Balance",
        "Converse",
        "Vans",
        "Reebok"
    ];
    const popularCategories = [
        "Running",
        "Basketball",
        "Casual",
        "Formal",
        "Sports",
        "Hiking",
        "Lifestyle"
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* <ToastContainer /> */}
            <DialogOverlay className={styles.overlay} />
            <DialogContent className={styles.modal}>
                <div className={styles.modalHeader}>
                    <DialogTitle className={styles.modalTitle}>
                        Update Product
                    </DialogTitle>
                    <DialogClose className={styles.closeButton}>
                        <X size={18} />
                    </DialogClose>
                </div>

                <DialogDescription className={styles.modalDescription}>
                    Edit the product information below to update this item in
                    your catalog.
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
                                    <span className={styles.helpText}>
                                        Enter discount percentage (0-100)
                                    </span>
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
                                    Enter sizes separated by commas (e.g., 7, 8,
                                    9, 10)
                                </span>
                                {form.formState.errors.sizes && (
                                    <span className={styles.errorText}>
                                        {form.formState.errors.sizes.message}
                                    </span>
                                )}
                                {form.watch("sizes") && (
                                    <div className={styles.tagsPreview}>
                                        {Array.isArray(form.watch("sizes"))
                                            ? form
                                                  .watch("sizes")
                                                  .map((size, i) => (
                                                      <span
                                                          key={i}
                                                          className={styles.tag}
                                                      >
                                                          {size}
                                                      </span>
                                                  ))
                                            : typeof form.watch("sizes") ===
                                                  "string" &&
                                              form
                                                  .watch("sizes")
                                                  .split(",")
                                                  .map((size, i) => (
                                                      <span
                                                          key={i}
                                                          className={styles.tag}
                                                      >
                                                          {size.trim()}
                                                      </span>
                                                  ))}
                                    </div>
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
                                                          .filter(Boolean)
                                                    : Array.isArray(
                                                          currentColors
                                                      )
                                                    ? currentColors
                                                    : [];

                                            const newColor = e.target.value;
                                            if (
                                                !colorArray.includes(newColor)
                                            ) {
                                                form.setValue("colors", [
                                                    ...colorArray,
                                                    newColor
                                                ]);
                                            }
                                        }}
                                    />
                                </div>
                                <span className={styles.helpText}>
                                    Enter hex color codes separated by commas or
                                    use the color picker
                                </span>
                                {form.formState.errors.colors && (
                                    <span className={styles.errorText}>
                                        {form.formState.errors.colors.message}
                                    </span>
                                )}
                                {form.watch("colors") && (
                                    <div className={styles.colorPreview}>
                                        {Array.isArray(form.watch("colors"))
                                            ? form
                                                  .watch("colors")
                                                  .map((color, i) => (
                                                      <span
                                                          key={i}
                                                          className={
                                                              styles.colorTag
                                                          }
                                                          style={{
                                                              backgroundColor:
                                                                  color
                                                          }}
                                                          title={color}
                                                      ></span>
                                                  ))
                                            : typeof form.watch("colors") ===
                                                  "string" &&
                                              form
                                                  .watch("colors")
                                                  .split(",")
                                                  .map((color, i) => {
                                                      const trimmedColor =
                                                          color.trim();
                                                      return trimmedColor ? (
                                                          <span
                                                              key={i}
                                                              className={
                                                                  styles.colorTag
                                                              }
                                                              style={{
                                                                  backgroundColor:
                                                                      trimmedColor
                                                              }}
                                                              title={
                                                                  trimmedColor
                                                              }
                                                          ></span>
                                                      ) : null;
                                                  })}
                                    </div>
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

                            {/* Product metadata display */}
                            <div className={styles.metadataSection}>
                                <h4 className={styles.metadataTitle}>
                                    Product Information
                                </h4>
                                {product && (
                                    <div className={styles.metadataGrid}>
                                        {product.createdAt && (
                                            <div
                                                className={styles.metadataItem}
                                            >
                                                <span
                                                    className={
                                                        styles.metadataLabel
                                                    }
                                                >
                                                    Created:
                                                </span>
                                                <span
                                                    className={
                                                        styles.metadataValue
                                                    }
                                                >
                                                    {product.createdAt}
                                                </span>
                                            </div>
                                        )}
                                        {product.updatedAt && (
                                            <div
                                                className={styles.metadataItem}
                                            >
                                                <span
                                                    className={
                                                        styles.metadataLabel
                                                    }
                                                >
                                                    Last Updated:
                                                </span>
                                                <span
                                                    className={
                                                        styles.metadataValue
                                                    }
                                                >
                                                    {product.updatedAt}
                                                </span>
                                            </div>
                                        )}
                                        {product.id && (
                                            <div
                                                className={styles.metadataItem}
                                            >
                                                <span
                                                    className={
                                                        styles.metadataLabel
                                                    }
                                                >
                                                    Product ID:
                                                </span>
                                                <span
                                                    className={
                                                        styles.metadataValue
                                                    }
                                                >
                                                    {product.id}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className={styles.cancelButton}
                            disabled={isSubmitting || isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isLoading}
                            className={styles.submitButton}
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className={styles.loader} />
                                    <span>Updating Product...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={styles.formFooter}>
                        <span className={styles.timestamp}>
                            Last updated: {CURRENT_DATETIME}
                        </span>
                        <span className={styles.userInfo}>
                            User: {CURRENT_USER}
                        </span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
