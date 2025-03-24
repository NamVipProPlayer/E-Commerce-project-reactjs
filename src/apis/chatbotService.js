import axiosClient from "./axiosClient.";

// Chat service for interacting with the chatbot API
export const chatService = {
    /**
     * Send a message to the chatbot
     * @param {string} message - The user's message
     * @returns {Promise} - Response with bot reply and any suggested shoes
     */
    sendMessage: async (message) => {
        try {
            // axiosClient will automatically add the auth token if user is logged in
            const response = await axiosClient.post("/api/chat", { message });
            return response.data;
        } catch (error) {
            console.error("Chat error:", error);
            // Format error for consistent handling in UI
            throw {
                status: error.response?.status || 500,
                message:
                    error.response?.data?.error ||
                    "Failed to communicate with chat assistant",
                details: error.response?.data?.details || error.message
            };
        }
    },

    /**
     * Clear chat history on the server (if supported)
     * @returns {Promise}
     */
    clearChatHistory: async () => {
        try {
            const response = await axiosClient.post("/api/chat/clear");
            return response.data;
        } catch (error) {
            console.error("Failed to clear chat history:", error);
            throw error;
        }
    }
};
