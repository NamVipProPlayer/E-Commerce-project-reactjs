import React, { useState } from "react";
import styles from "./ProductCard.module.scss";

function ProductCard({ product, addToCart, isLoading }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleAddToBag = async () => {
        if (!selectedSize) {
            alert("Please select a size first");
            return;
        }

        setSubmitLoading(true);
        const success = await addToCart(selectedSize);
        if (!success) {
            setSubmitLoading(false);
        }
        // If success is true, the modal will be closed by the parent component
    };

    if (!product) {
        return (
            <div className={styles.errorContainer}>
                <p>Product not found</p>
            </div>
        );
    }

    return (
        <div className={styles.productCard}>
            <div className={styles.productContainer}>
                {/* Product Image */}
                <div className={styles.imageContainer}>
                    <img
                        src={product.fSrc || "https://via.placeholder.com/500"}
                        alt={product.name}
                        className={styles.productImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/500";
                        }}
                    />
                </div>

                {/* Product Details */}
                <div className={styles.detailsContainer}>
                    <div className={styles.detailsContent}>
                        {/* Category */}
                        <p className={styles.category}>
                            {product.category || "Men's Shoes"}
                        </p>

                        {/* Product Name */}
                        <h1 className={styles.productName}>{product.name}</h1>

                        {/* Price */}
                        <p className={styles.price}>
                            ${product.price?.toFixed(2) || "N/A"}
                        </p>

                        {/* Size Selection */}
                        <div className={styles.sizeSelectionContainer}>
                            <h2 className={styles.sizeTitle}>Select Size</h2>

                            <div className={styles.sizeGrid}>
                                {product.sizes && product.sizes.length > 0 ? (
                                    product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            className={`${styles.sizeButton} ${
                                                selectedSize === size
                                                    ? styles.selected
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleSizeSelect(size)
                                            }
                                        >
                                            {size}
                                        </button>
                                    ))
                                ) : (
                                    <p className={styles.noSizes}>
                                        No sizes available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Add to Bag Button */}
                        <button
                            className={styles.addToBagButton}
                            onClick={handleAddToBag}
                            disabled={
                                !selectedSize || isLoading || submitLoading
                            }
                        >
                            {isLoading || submitLoading
                                ? "Adding to Bag..."
                                : "Add to Bag"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
