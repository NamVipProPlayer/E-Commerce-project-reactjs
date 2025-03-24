import axiosClient from "@/apis/axiosClient.";

const orderService = {
    /**
     * Create a new order
     * @param {Object} orderData - Order data containing items, shipping address, etc.
     * @returns {Promise} - API response
     */
    createOrder: async (orderData) => {
        try {
            const response = await axiosClient.post("/api/order", orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get all orders (admin only)
     * @param {Object} params - Query parameters for filtering, pagination
     * @returns {Promise} - API response with orders list
     */
    getAllOrders: async (params = {}) => {
        try {
            const response = await axiosClient.get("/api/order", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get current user's orders
     * @param {Object} params - Query parameters for filtering, pagination
     * @returns {Promise} - API response with user's orders
     */
    getUserOrders: async () => {
        try {
            const response = await axiosClient.get("/api/order/myorders");
            // Ensure we return the orders array from the response
            return response.data.orders || response.data || [];
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get order statistics (admin only)
     * @param {Object} params - Query parameters for date range
     * @returns {Promise} - API response with order statistics
     */
    getOrderStatistics: async (params = {}) => {
        try {
            const response = await axiosClient.get("/api/order/statistics", {
                params
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get orders by product ID (admin only)
     * @param {String} productId - Product ID
     * @param {Object} params - Query parameters for pagination
     * @returns {Promise} - API response with orders containing the product
     */
    getOrdersByProduct: async (productId, params = {}) => {
        try {
            const response = await axiosClient.get(
                `/api/order/product/${productId}`,
                { params }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get order by ID
     * @param {String} orderId - Order ID
     * @returns {Promise} - API response with order details
     */
    getOrderById: async (orderId) => {
        try {
            const response = await axiosClient.get(`/api/order/${orderId}`);
            console.log("url", response);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update order status (admin only)
     * @param {String} orderId - Order ID
     * @param {Object} updateData - Data containing status changes
     * @returns {Promise} - API response
     */
    updateOrderStatus: async (orderId, updateData) => {
        try {
            const response = await axiosClient.put(
                `/api/order/${orderId}`,
                updateData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Comprehensive order update (admin only)
     * @param {String} orderId - Order ID
     * @param {Object} updateData - Complete data for order update
     * @returns {Promise} - API response with updated order
     */
    updateOrder: async (orderId, updateData) => {
        try {
            // Add metadata to the update
            const dataWithMetadata = {
                ...updateData,
                updatedAt: "2025-03-21 06:05:58", // Current timestamp
                updatedBy: "NamProPlayer20" // Current user
            };

            const response = await axiosClient.put(
                `/api/order/${orderId}/update`,
                dataWithMetadata
            );
            return response.data;
        } catch (error) {
            console.error("Error updating order:", error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Delete order (admin only)
     * @param {String} orderId - Order ID
     * @returns {Promise} - API response
     */
    deleteOrder: async (orderId) => {
        try {
            const response = await axiosClient.delete(`/api/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Cancel an order
     * @param {String} orderId - Order ID
     * @param {Object} cancelData - Optional cancellation reason
     * @returns {Promise} - API response
     */
    cancelOrder: async (orderId, cancelData = {}) => {
        try {
            const response = await axiosClient.put(
                `/api/order/${orderId}/cancel`,
                cancelData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update shipping address
     * @param {String} orderId - Order ID
     * @param {Object} shippingData - New shipping address data
     * @returns {Promise} - API response
     */
    updateShippingAddress: async (orderId, shippingData) => {
        try {
            const response = await axiosClient.put(
                `/api/order/${orderId}/shipping`,
                shippingData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Generate order receipt/invoice
     * @param {String} orderId - Order ID
     * @returns {Promise} - API response with receipt data
     */
    generateReceipt: async (orderId) => {
        try {
            const response = await axiosClient.get(
                `/api/order/${orderId}/receipt`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Process refund for an order (admin only)
     * @param {String} orderId - Order ID
     * @param {Object} refundData - Refund details
     * @returns {Promise} - API response
     */
    processRefund: async (orderId, refundData) => {
        try {
            const response = await axiosClient.post(
                `/api/order/${orderId}/refund`,
                refundData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update order notes
     * @param {String} orderId - Order ID
     * @param {Object} notesData - Updated notes
     * @returns {Promise} - API response
     */
    updateOrderNotes: async (orderId, notesData) => {
        try {
            const response = await axiosClient.put(
                `/api/order/${orderId}/notes`,
                notesData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Send order confirmation notification (admin only)
     * @param {String} orderId - Order ID
     * @returns {Promise} - API response
     */
    sendConfirmation: async (orderId) => {
        try {
            const response = await axiosClient.post(
                `/api/order/${orderId}/send-confirmation`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create checkout session for cart items
     * @param {Object} checkoutData - Cart data for checkout
     * @returns {Promise} - API response with checkout session info
     */
    createCheckout: async (checkoutData) => {
        try {
            const response = await axiosClient.post(
                "/api/order/checkout",
                checkoutData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Format order data from cart for submission
     * @param {Object} cartData - Cart data from API
     * @param {Object} shippingAddress - User's shipping address
     * @param {String} paymentMethod - Selected payment method
     * @param {String} notes - Optional order notes
     * @returns {Object} - Formatted order data ready for submission
     */
    formatOrderData: (cartData, shippingAddress, paymentMethod, notes = "") => {
        // Extract items data
        const items = cartData.items.map((item) => ({
            product: item.product._id,
            size: item.size,
            quantity: item.quantity,
            price: item.price
        }));

        // Calculate totals
        const totalAmount = cartData.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Default shipping to 0 (free) or calculate based on your business logic
        const shipping = 0;

        // Apply any discount from cart if available
        const discount = cartData.discount || 0;

        // Calculate final amount
        const finalAmount = totalAmount + shipping - discount;

        // Return formatted order data
        return {
            items,
            totalAmount,
            shipping,
            discount,
            finalAmount,
            shippingAddress,
            paymentMethod,
            customerNotes: notes
        };
    },

    /**
     * Get status label with appropriate styling class
     * @param {String} status - Order status
     * @returns {Object} - Object containing label and CSS class
     */
    getStatusInfo: (status) => {
        const statusMap = {
            Processing: { label: "Processing", cssClass: "status-processing" },
            Shipped: { label: "Shipped", cssClass: "status-shipped" },
            Delivered: { label: "Delivered", cssClass: "status-delivered" },
            Cancelled: { label: "Cancelled", cssClass: "status-cancelled" }
        };

        return (
            statusMap[status] || { label: status, cssClass: "status-default" }
        );
    },

    /**
     * Get payment status label with appropriate styling class
     * @param {String} paymentStatus - Payment status
     * @returns {Object} - Object containing label and CSS class
     */
    getPaymentStatusInfo: (paymentStatus) => {
        const paymentStatusMap = {
            Pending: { label: "Pending", cssClass: "payment-pending" },
            Paid: { label: "Paid", cssClass: "payment-paid" },
            Failed: { label: "Failed", cssClass: "payment-failed" },
            Refunded: { label: "Refunded", cssClass: "payment-refunded" }
        };

        return (
            paymentStatusMap[paymentStatus] || {
                label: paymentStatus,
                cssClass: "payment-default"
            }
        );
    },

    /**
     * Format date for display
     * @param {String} dateString - Date string from API
     * @returns {String} - Formatted date string
     */
    formatDate: (dateString) => {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    }
};

export default orderService;
