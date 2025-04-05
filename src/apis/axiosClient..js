import axios from "axios";
//http://localhost:8080
//https://backendimg-rmha.onrender.com
const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
});
// Interceptor to include token in requests
axiosClient.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;
