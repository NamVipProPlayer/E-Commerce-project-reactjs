import { useMemo } from "react";

/**
 * Custom hook to handle free shipping qualification logic
 * @param {number} subtotal - Order subtotal amount
 * @param {number} shippingCost - Current shipping cost
 * @param {number} total - Current total including shipping
 * @returns {Object} Object containing qualification status and adjusted values
 */
const useShippingQualification = (subtotal, shippingCost, total) => {
    return useMemo(() => {
        // Check if order qualifies for free shipping (over $500)
        const qualifiesForFreeShipping = subtotal >= 500;

        // Calculate the adjusted total based on qualification
        const adjustedTotal = qualifiesForFreeShipping
            ? total - shippingCost
            : total;

        // Return the qualification status and adjusted values
        return {
            qualifiesForFreeShipping,
            adjustedTotal,
            shippingDisplay: qualifiesForFreeShipping
                ? "Free"
                : `${shippingCost}$`
        };
    }, [subtotal, shippingCost, total]);
};

export default useShippingQualification;
