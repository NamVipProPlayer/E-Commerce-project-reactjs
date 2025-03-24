import axiosClient from "@/apis/axiosClient.";

// Get all products
const getProduct = async () => {
    const res = await axiosClient.get("/api/product");
    return res.data;
};

// Get a single product by ID
const getProductById = async (id) => {
    const res = await axiosClient.get(`/api/product/${id}`);
    return res.data;
};

// Create a new product
const createProduct = async (formData) => {
    const res = await axiosClient.post("/api/product", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

// Update a product by ID
const updateProduct = async (id, formData) => {
    const res = await axiosClient.put(`/api/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

// Delete a product by ID
const deleteProduct = async (id) => {
    const res = await axiosClient.delete(`/api/product/${id}`);
    return res.data;
};

export {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
