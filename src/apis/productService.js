import axiosClient from "@/apis/axiosClient.";

const getProduct = async () => {
    const res = await axiosClient.get("/product");
    console.log(res);
};

export { getProduct };
