import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://e-commerce-project-reactjs.vercel.app/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;