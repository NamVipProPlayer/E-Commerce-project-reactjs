import axiosClient from "@/apis/axiosClient.";

const userService = {
    // Register User
    register: async (userData) => {
        try {
            const response = await axiosClient.post(
                "/api/auth/register",
                userData
            );
            return response.data;
        } catch (error) {
            console.error("Registration Error:", error.response?.data);
            throw error.response?.data || { message: "Registration failed." };
        }
    },

    // Login User
    login: async (credentials) => {
        try {
            const response = await axiosClient.post(
                "/api/auth/login",
                credentials
            );
            return response.data; // Returns { token, user }
        } catch (error) {
            throw error.response?.data || { message: "Login failed." };
        }
    },

    // Get User Profile (Protected)
    getProfile: async () => {
        try {
            const token =
                localStorage.getItem("authToken") ||
                sessionStorage.getItem("authToken"); // Or sessionStorage
            if (!token) throw { message: "No token found, please login." };

            const response = await axiosClient.get("/api/auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            throw (
                error.response?.data || { message: "Failed to fetch profile." }
            );
        }
    },
    //update profile
    updateProfile: async (updateData) => {
        try {
            const response = await axiosClient.put(
                "/api/auth/updateProfile",
                updateData
            );
            console.log("Profile update response:", response.data);
            return response.data;
        } catch (error) {
            console.error(
                "Profile Update Error:",
                error.response?.data || error
            );
            throw (
                error.response?.data || {
                    success: false,
                    message: "Failed to update profile"
                }
            );
        }
    },
    // Get All Users (Admin Only)
    getUsers: async () => {
        try {
            const response = await axiosClient.get("/api/auth/users");
            console.log("Users fetched successfully:", response.data); // Debugging API response
            return response.data;
        } catch (error) {
            console.error(
                "Error fetching users:",
                error.response?.data || error
            );
            throw error.response?.data || { message: "Failed to fetch users." };
        }
    },

    // Create User (Admin Only)
    createUser: async (userData) => {
        try {
            const response = await axiosClient.post(
                "/api/auth/admin/create-user",
                userData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create user." };
        }
    },
    // Update User (Admin Only)
    UpdateUserInfo: async (userId, userData) => {
        try {
            const response = await axiosClient.put(
                `api/auth/admin/update-user/${userId}`,
                userData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update user." };
        }
    },

    // Admin Dashboard Access
    getAdminDashboard: async () => {
        try {
            const response = await axiosClient.get("/api/auth/admin");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Admin access denied." };
        }
    },

    // Delete User (Admin Only)
    deleteUserAdminRole: async (userId) => {
        try {
            const response = await axiosClient.delete(
                `/api/auth/user/${userId}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete user." };
        }
    }
};

export default userService;
