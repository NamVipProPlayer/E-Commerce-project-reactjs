import axiosClient from "@/apis/axiosClient.";

const wishlistService = {
    // Get user's wishlist
    getWishlist: async () => {
        try {
            const response = await axiosClient.get("api/wishlist/");
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to fetch wishlist";
        }
    },

    // Add a product to wishlist
    addToWishlist: async (productId) => {
        try {
            const response = await axiosClient.post("api/wishlist/add", {
                productId
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to add product to wishlist";
        }
    },

    // Remove a product from wishlist
    removeFromWishlist: async (productId) => {
        try {
            const response = await axiosClient.delete(
                `api/wishlist/${productId}`
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || "Failed to remove product from wishlist"
            );
        }
    }
};

export default wishlistService;
