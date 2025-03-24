import axiosClient from "@/apis/axiosClient.";

const cartService = {
    // Get user's cart
    getCart: async () => {
        try {
            const response = await axiosClient.get("api/cart");
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to fetch cart";
        }
    },

    // Add product to cart
    addToCart: async ({ productId, quantity, size }) => {
        try {
            const response = await axiosClient.post("api/cart/add", {
                productId,
                quantity,
                size
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to add product to cart";
        }
    },

    // Update cart item (quantity and/or size)
    updateCartItem: async ({ productId, quantity, size }) => {
        try {
            const updateData = {
                productId
            };

            // Only include fields that are provided
            if (quantity !== undefined) updateData.quantity = quantity;
            if (size !== undefined) updateData.size = size;

            const response = await axiosClient.put(
                "api/cart/update",
                updateData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to update cart item";
        }
    },
    // Remove product from cart
    removeFromCart: async (productId, size) => {
        try {
            const response = await axiosClient.delete(
                `api/cart/remove/${productId}`,
                {
                    data: { size } // Send size in the request body
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to remove product from cart";
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            const response = await axiosClient.delete("api/cart/clear");
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to clear cart";
        }
    }
};

export default cartService;
