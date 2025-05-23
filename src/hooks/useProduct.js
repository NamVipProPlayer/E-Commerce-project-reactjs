import { useState, useEffect } from "react";
import cartService from "@apis/cartService";

const shippingOptions = {
    standard: 5,
    fast: 12,
    airplane: 20
};

const validDiscounts = {
    SAVE10: 10, // 10% discount
    FREE50: 50 // $50 discount
};

export function useCart(cart) {
    const [quantities, setQuantities] = useState({});
    const [shippingCost, setShippingCost] = useState(shippingOptions.standard);
    const [discountCode, setDiscountCode] = useState("");
    const [discountValue, setDiscountValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    // Initialize quantities from cart items and set up cartItems state
    useEffect(() => {
        if (cart && cart.items) {
            setQuantities(
                cart.items.reduce((acc, item) => {
                    acc[item.product._id] = item.quantity;
                    return acc;
                }, {})
            );
            setCartItems(cart.items);
        }
    }, [cart]);

    // Update quantity with database persistence
    const updateQuantity = async (productId, change) => {
        try {
            // Calculate new quantity
            const currentQuantity = quantities[productId] || 0;
            const newQuantity = Math.max(1, currentQuantity + change);

            // Set loading state
            setIsLoading(true);

            // Update local state first for immediate UI feedback
            setQuantities((prev) => ({
                ...prev,
                [productId]: newQuantity
            }));

            // Send update to the server
            await cartService.updateCartItem({
                productId,
                quantity: newQuantity
            });

            console.log(
                `Product ${productId} quantity updated to ${newQuantity} in database`
            );
            setError(null);
        } catch (err) {
            console.error("Error updating cart item quantity:", err);

            // Revert to previous quantity on error
            setQuantities((prev) => ({
                ...prev,
                [productId]: quantities[productId] || 0
            }));

            setError("Failed to update quantity. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Add new state to track size updates
    const [isUpdatingSize, setIsUpdatingSize] = useState(false);

    // Add this new function to update item size
    const updateItemSize = async (productId, newSize) => {
        try {
            setIsUpdatingSize(true);
            setError(null);

            // Call your API to update the item size
            await cartService.updateCartItem({
                productId,
                size: newSize
            });

            // Update the local state to reflect the size change
            // Preserve price information when updating size
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.product._id === productId
                        ? { ...item, size: newSize }
                        : item
                )
            );

            console.log(`Updated size of product ${productId} to ${newSize}`);
        } catch (err) {
            console.error("Failed to update item size:", err);
            setError("Failed to update size. Please try again.");
            throw err;
        } finally {
            setIsUpdatingSize(false);
        }
    };

    // Change shipping method
    const changeShipping = (option) => {
        setShippingCost(shippingOptions[option]);
    };

    // Apply discount code
    const applyDiscount = (code) => {
        if (validDiscounts[code]) {
            setDiscountValue(validDiscounts[code]);
            setDiscountCode(code);
            return true;
        } else {
            setDiscountValue(0);
            setDiscountCode("");
            return false;
        }
    };

    // Calculate subtotal using the item's sale price if available, otherwise fall back to product price
    const subtotal = cartItems
        ? cartItems.reduce(
              (sum, item) =>
                  sum +
                  (quantities[item.product._id] || 0) * 
                  (item.price || item.product.price),
              0
          )
        : 0;

    // Calculate total savings from sales
    const totalSavings = cartItems
        ? cartItems.reduce((sum, item) => {
              if (!item.sale || item.sale <= 0) return sum;
              
              const originalPrice = item.originalPrice || item.product.price;
              const salePrice = item.price || item.product.price;
              const quantity = quantities[item.product._id] || 0;
              
              return sum + ((originalPrice - salePrice) * quantity);
          }, 0)
        : 0;

    // Calculate total after discount and shipping
    const total = Math.max(
        0,
        subtotal -
            (discountValue < 100
                ? (subtotal * discountValue) / 100
                : discountValue) +
            shippingCost
    );

    return {
        cartItems: cartItems || [],
        quantities,
        updateQuantity,
        shippingCost,
        changeShipping,
        discountCode,
        setDiscountCode,
        applyDiscount,
        total,
        isLoading,
        error,
        setError,
        updateItemSize,
        isUpdatingSize,
        totalSavings
    };
}
