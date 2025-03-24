import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./stylesShopingCart.module.scss";
import { IoClose } from "react-icons/io5";
import { Form, Spinner } from "react-bootstrap";
import cartService from "@apis/cartService.js";
import productService from "@apis/shoesProductService.js"; // Import product service to fetch sizes

function CartItemsList({
    cartItems,
    quantities,
    updateQuantity,
    onDelete,
    isLoading,
    updateItemSize
}) {
    // Store cart items locally for optimistic updates
    const [localCartItems, setLocalCartItems] = useState(cartItems || []);

    // Track which items have size dropdowns open
    const [changingSize, setChangingSize] = useState({});
    // Store available sizes for each product
    const [productSizes, setProductSizes] = useState({});
    // Track loading state for each product's sizes
    const [loadingSizes, setLoadingSizes] = useState({});

    // Update localCartItems whenever cartItems changes from outside
    useEffect(() => {
        setLocalCartItems(cartItems || []);
    }, [cartItems]);

    const isEmptyCart = !localCartItems || localCartItems.length === 0;

    // Fetch available sizes for all products in the cart
    useEffect(() => {
        if (isEmptyCart) return;

        const fetchProductSizes = async () => {
            // Create an array of unique product IDs from cart
            const productIds = [
                ...new Set(localCartItems.map((item) => item.product._id))
            ];

            // Create a map to track which products are loading sizes
            const loadingMap = {};
            productIds.forEach((id) => {
                loadingMap[id] = true;
            });
            setLoadingSizes(loadingMap);

            // Fetch sizes for each product
            const sizesPromises = productIds.map(async (productId) => {
                try {
                    // Get product details to access available sizes
                    const productData = await productService.getShoeProductById(
                        productId
                    );
                    return {
                        productId,
                        sizes: productData.sizes || []
                    };
                } catch (error) {
                    console.error(
                        `Failed to fetch sizes for product ${productId}:`,
                        error
                    );
                    return {
                        productId,
                        sizes: []
                    };
                } finally {
                    // Mark this product as done loading
                    setLoadingSizes((prev) => ({
                        ...prev,
                        [productId]: false
                    }));
                }
            });

            // Wait for all size fetch operations to complete
            const results = await Promise.all(sizesPromises);

            // Create a map of productId -> available sizes
            const sizesMap = {};
            results.forEach((result) => {
                sizesMap[result.productId] = result.sizes;
            });

            setProductSizes(sizesMap);
        };

        fetchProductSizes();
    }, [localCartItems, isEmptyCart]);

    // Fallback sizes if backend doesn't provide any
    const defaultSizes = ["5", "6", "7", "8", "9", "10", "11", "12", "13"];

    // Handle size change with optimistic update
    const handleSizeChange = async (productId, newSize) => {
        // Immediately update localCartItems in the UI before the server call
        setLocalCartItems((prev) =>
            prev.map((cartItem) => {
                if (cartItem.product._id === productId) {
                    return {
                        ...cartItem,
                        size: newSize
                    };
                }
                return cartItem;
            })
        );

        try {
            setChangingSize((prev) => ({ ...prev, [productId]: true }));

            await cartService.updateCartItem({
                productId,
                size: newSize
            });

            // If your updateItemSize function is part of a custom hook or context
            if (updateItemSize) {
                await updateItemSize(productId, newSize);
            }
        } catch (error) {
            console.error("Failed to update size:", error);
            // Optionally revert size on error if needed
        } finally {
            setChangingSize((prev) => ({ ...prev, [productId]: false }));
        }
    };

    if (isEmptyCart) {
        return (
            <div className="text-center p-4">
                <p>Your cart is empty.</p>
                <div className={styles.backToShop}>
                    <a href="/products">Continue shopping</a>
                </div>
            </div>
        );
    }

    return (
        <>
            {localCartItems.map((item, index) => {
                // Create a unique key using both product ID and index
                const itemKey = `${item.product._id}-${index}`;
                const isItemLoading =
                    isLoading &&
                    quantities[item.product._id] !== (item.quantity || 1);

                // Check if this item's size is being changed
                const isSizeChanging = changingSize[item.product._id];

                // Get available sizes for this product
                const isLoadingSizes = loadingSizes[item.product._id];
                const availableSizes =
                    productSizes[item.product._id] || defaultSizes;

                return (
                    <div key={itemKey} className={styles.productItem}>
                        {/* Position the delete icon at the absolute top-right of the product item */}
                        {onDelete && (
                            <div className={styles.deleteButtonWrapper}>
                                <IoClose
                                    className={styles.deleteIcon}
                                    onClick={() => onDelete(item.product._id,item.size)}
                                />
                            </div>
                        )}

                        <div className="row align-items-center g-2">
                            <div className="col-4">
                                <img
                                    src={
                                        item.product.fSrc ||
                                        "https://via.placeholder.com/100"
                                    }
                                    className={classNames(
                                        "img-fluid rounded-3",
                                        styles.productImage
                                    )}
                                    alt={item.product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            "https://via.placeholder.com/100";
                                    }}
                                />
                            </div>
                            <div
                                className={classNames(
                                    "col-8",
                                    styles.productDetails
                                )}
                            >
                                <h6 className="text-muted">
                                    {item.product.category}
                                </h6>
                                <h6 className="text-black">
                                    {item.product.name}
                                </h6>

                                {/* Size dropdown */}
                                <div
                                    className={classNames(
                                        "mb-3",
                                        styles.sizeSelector
                                    )}
                                >
                                    <small className="text-muted">Size: </small>
                                    {isSizeChanging || isLoadingSizes ? (
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="ms-2"
                                        />
                                    ) : (
                                        <Form.Select
                                            size="sm"
                                            value={item.size || ""}
                                            onChange={(e) =>
                                                handleSizeChange(
                                                    item.product._id,
                                                    e.target.value
                                                )
                                            }
                                            className={styles.sizeDropdown}
                                            disabled={isLoading}
                                        >
                                            <option value="" disabled>
                                                Select Size
                                            </option>
                                            {availableSizes.map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </div>

                                <div className={styles.quantityControls}>
                                    <button
                                        className={classNames(
                                            "btn btn-outline-secondary btn-sm",
                                            styles.smallButton
                                        )}
                                        onClick={async () => {
                                            try {
                                                await updateQuantity(
                                                    item.product._id,
                                                    -1
                                                );
                                            } catch (err) {
                                                console.error(
                                                    "Failed to update quantity:",
                                                    err
                                                );
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        -
                                    </button>
                                    <div
                                        className={styles.quantityInputWrapper}
                                    >
                                        {isItemLoading ? (
                                            <div
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                min="1"
                                                value={
                                                    quantities[
                                                        item.product._id
                                                    ] ||
                                                    item.quantity ||
                                                    1
                                                }
                                                type="number"
                                                className={classNames(
                                                    "form-control form-control-sm",
                                                    styles.quantityInput
                                                )}
                                                readOnly
                                            />
                                        )}
                                    </div>
                                    <button
                                        className={classNames(
                                            "btn btn-outline-secondary btn-sm",
                                            styles.smallButton
                                        )}
                                        onClick={async () => {
                                            try {
                                                await updateQuantity(
                                                    item.product._id,
                                                    1
                                                );
                                            } catch (err) {
                                                console.error(
                                                    "Failed to update quantity:",
                                                    err
                                                );
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <h6>${item.product.price}</h6>
                                </div>
                            </div>
                        </div>
                        <hr />
                    </div>
                );
            })}
        </>
    );
}

export default CartItemsList;
