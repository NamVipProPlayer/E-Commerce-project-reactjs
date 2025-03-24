import axiosClient from "@/apis/axiosClient.";
const shoesProductService = {
    // Get all shoes products
    getAllShoesProducts: async () => {
        try {
            const response = await axiosClient.get("/api/shoesRoute");
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to fetch products." }
            );
        }
    },

    // Get a single shoe product by ID
    getShoeProductById: async (shoeId) => {
        try {
            const response = await axiosClient.get(`/api/shoesRoute/${shoeId}`);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to fetch product." }
            );
        }
    },

    // Create a new shoe product
    createShoeProduct: async (productData) => {
        try {
            const response = await axiosClient.post(
                "/api/shoesRoute",
                productData
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to create product." }
            );
        }
    },

    // Update an existing shoe product
    updateShoeProduct: async (productId, updatedData) => {
        try {
            const response = await axiosClient.put(
                `/api/shoesRoute/${productId}`,
                updatedData
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to update product." }
            );
        }
    },

    // Delete a shoe product
    deleteShoeProduct: async (productId) => {
        try {
            const response = await axiosClient.delete(
                `/api/shoesRoute/${productId}`
            );
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to delete product." }
            );
        }
    }
};

export default shoesProductService;
