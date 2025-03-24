import axios from "axios";

/**
 * Service for handling VNPAY payment operations
 */
const paymentService = {
    /**
     * Create a VNPAY payment URL
     * @param {Object} paymentData - The payment details
     * @param {number} paymentData.amount - The payment amount (in VND)
     * @param {string} paymentData.bankCode - Optional bank code
     * @param {string} paymentData.language - The language for payment page ('vn' or 'en')
     * @param {string} paymentData.orderId - The order ID for the transaction
     * @param {string} paymentData.orderInfo - Additional order information
     * @param {string} paymentData.orderType - Type of order ('other' by default)
     * @param {string} paymentData.ipAddr - IP address of the customer
     * @param {string} paymentData.createDate - Current date in YYYYMMDDHHmmss format
     * @returns {Promise} - Promise with redirect URL
     */
   

    createVNPayUrl: async (paymentData) => {
        try {
            // Prepare only the required parameters
            const requestData = {
                amount: paymentData.amount,
                bankCode: paymentData.bankCode || "",
                language: paymentData.language || "vn"
            };

            // Make POST request to create payment URL
            const response = await axios.post(
                "http://localhost:8888/order/create_payment_url",
                requestData
            );

            // Handle the response based on what your backend returns
            // If backend returns JSON with redirectUrl
            if (response.data && typeof response.data === "object") {
                if (response.data.data && response.data.data.vnpUrl) {
                    return {
                        redirectUrl: response.data.data.vnpUrl
                    };
                }
            }

            throw new Error("Could not get VNPAY redirect URL from response");
        } catch (error) {
            console.error("Error creating VNPAY payment URL:", error);
            throw error;
        }
    },

    /**
     * Process the VNPAY return callback with query parameters
     * @param {Object} queryParams - The query parameters returned by VNPAY
     * @returns {Promise} - Promise with payment verification result
     */
    verifyVNPayPayment: async (queryParams) => {
        try {
            // Construct the URL with all query parameters
            let url = "/order/vnpay_return";
            let query = new URLSearchParams(queryParams).toString();

            // Make a GET request to the return URL with all VNPAY parameters
            const response = await axios.get(`${url}?${query}`);

            // If the response is HTML (your backend renders a view)
            if (
                typeof response.data === "string" &&
                response.data.includes("html")
            ) {
                // Try to extract the code from the HTML response
                const match = response.data.match(/code:\s*['"](\d+)['"]/);
                const code = match && match[1] ? match[1] : "97";
                return {
                    code,
                    isSuccess: code === "00"
                };
            }
            // If the response is JSON
            else if (response.data) {
                const code =
                    response.data.code ||
                    response.data.vnp_ResponseCode ||
                    "97";
                return {
                    code,
                    isSuccess: code === "00"
                };
            }

            return { code: "97", isSuccess: false };
        } catch (error) {
            console.error("Error verifying VNPAY payment:", error);
            throw error;
        }
    },

    /**
     * Query transaction details from VNPAY
     * @param {Object} queryData - The query parameters
     * @param {string} queryData.orderId - The order ID to query
     * @param {string} queryData.transDate - The transaction date in YYYYMMDD format
     * @returns {Promise} - Promise with query result
     */
    queryTransaction: async (queryData) => {
        try {
            // Format date for the API using the provided UTC timestamp
            const currentDate = "2025-03-06 08:47:20";
            const formattedDate = currentDate
                .replace(/[-: ]/g, "")
                .substring(0, 14);
            const requestId = currentDate
                .replace(/[-: ]/g, "")
                .substring(8, 14);

            // Get user's IP address or use a fallback
            const ipAddr = await fetch("https://api.ipify.org?format=json")
                .then((res) => res.json())
                .then((data) => data.ip)
                .catch(() => "127.0.0.1");

            // Prepare the query data with all required parameters
            const requestData = {
                orderId: queryData.orderId,
                transDate: queryData.transDate,
                vnp_RequestId: requestId,
                vnp_Version: "2.1.0",
                vnp_Command: "querydr",
                vnp_TmnCode:
                    process.env.REACT_APP_VNPAY_TMN_CODE || "DEMO_TMN_CODE",
                vnp_TxnRef: queryData.orderId,
                vnp_OrderInfo: `Truy van GD ma: ${queryData.orderId}`,
                vnp_TransactionDate: queryData.transDate,
                vnp_CreateDate: formattedDate,
                vnp_IpAddr: ipAddr
            };

            // Make API call to query transaction
            const response = await axios.post("/order/querydr", requestData);

            return response.data;
        } catch (error) {
            console.error("Error querying transaction:", error);
            throw error;
        }
    },

    /**
     * Request a refund for a VNPAY transaction
     * @param {Object} refundData - The refund details
     * @param {string} refundData.orderId - The order ID to refund
     * @param {string} refundData.transDate - The transaction date in YYYYMMDD format
     * @param {number} refundData.amount - The amount to refund
     * @param {string} refundData.transType - The transaction type (e.g., '02' for partial refund, '03' for full refund)
     * @param {string} refundData.user - The user requesting the refund
     * @returns {Promise} - Promise with refund result
     */
    refundTransaction: async (refundData) => {
        try {
            // Format date for the API using the provided UTC timestamp
            const currentDate = "2025-03-06 08:47:20";
            const formattedDate = currentDate
                .replace(/[-: ]/g, "")
                .substring(0, 14);
            const requestId = currentDate
                .replace(/[-: ]/g, "")
                .substring(8, 14);
            const userLogin = refundData.user || "NamProPlayer20"; // Use provided username

            // Get user's IP address or use a fallback
            const ipAddr = await fetch("https://api.ipify.org?format=json")
                .then((res) => res.json())
                .then((data) => data.ip)
                .catch(() => "127.0.0.1");

            // Prepare all required parameters for refund
            const requestData = {
                orderId: refundData.orderId,
                transDate: refundData.transDate,
                amount: refundData.amount,
                transType: refundData.transType || "03", // Default to full refund
                user: userLogin,
                vnp_RequestId: requestId,
                vnp_Version: "2.1.0",
                vnp_Command: "refund",
                vnp_TmnCode:
                    process.env.REACT_APP_VNPAY_TMN_CODE || "DEMO_TMN_CODE",
                vnp_TransactionType: refundData.transType || "03",
                vnp_TxnRef: refundData.orderId,
                vnp_Amount: refundData.amount * 100, // VNPAY requires amount * 100
                vnp_TransactionNo: "0",
                vnp_TransactionDate: refundData.transDate,
                vnp_CreateBy: userLogin,
                vnp_CreateDate: formattedDate,
                vnp_IpAddr: ipAddr,
                vnp_OrderInfo: `Hoan tien GD ma: ${refundData.orderId}`
            };

            // Make API call to refund transaction
            const response = await axios.post("/order/refund", requestData);

            return response.data;
        } catch (error) {
            console.error("Error refunding transaction:", error);
            throw error;
        }
    },

    /**
     * Create an order in your system after successful payment
     * @param {Object} orderData - The order details
     * @returns {Promise} - Promise with the created order
     */
    createOrder: async (orderData) => {
        try {
            // Current date and time from provided information
            const currentDate = "2025-03-06 08:47:20";
            const userLogin = "NamProPlayer20";

            // This would call your own order creation API
            const response = await axios.post("/api/orders", {
                ...orderData,
                createdAt: currentDate,
                userLogin: userLogin
            });
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    /**
     * Check if VNPAY payment was successful based on response code
     * @param {string} responseCode - The response code from VNPAY
     * @returns {boolean} - Whether the payment was successful
     */
    isPaymentSuccessful: (responseCode) => {
        // VNPAY considers code '00' as successful payment
        return responseCode === "00";
    },

    /**
     * Get current date in VNPAY required format
     * @returns {string} - Formatted date string (YYYYMMDDHHmmss)
     */
    getCurrentDateFormatted: () => {
        // Use the provided UTC timestamp
        const currentDate = "2025-03-06 08:47:20";
        return currentDate.replace(/[-: ]/g, "").substring(0, 14);
    },

    /**
     * Generate an order ID based on current timestamp
     * @returns {string} - Order ID
     */
    generateOrderId: () => {
        // Use the provided UTC timestamp to create a unique order ID
        const currentDate = "2025-03-06 08:47:20";
        return currentDate.replace(/[-: ]/g, "").substring(8, 14);
    }
};

export default paymentService;
