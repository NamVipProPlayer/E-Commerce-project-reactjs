import axiosClient from "@/apis/axiosClient.";

const getProduct = async () => {
    const res = await axiosClient.get("/product");
    return res.data;
};

export { getProduct };
