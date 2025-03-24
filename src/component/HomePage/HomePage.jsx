import MainLayout from "@component/Layout/Layout";
import Header from "@component/Header/Header";
import Banner from "@component/Banner/Banner";
import styles from "./HomePage.module.scss";
import InfoSection from "@component/SectionInfo/InfoSection";
import AdvanceHeading from "@component/AdvanceHeading/AdvanceHeading";
import ListProduct from "@component/ListProductHeading/ListProductHeading";
import { getProduct } from "@/apis/productService.js";
import { useEffect, useState } from "react";
import PopularProduct from "@component/PopularProduct/PopularProduct";
import ScrollBanner from "@component/ScrollBanner/ScrollBanner";
import Footer from "@component/Footer/Footer";
function HomePage() {
    const { container } = styles;
    const [listProduct, setListProduct] = useState([]);

    useEffect(() => {
        getProduct().then((res) => {
            setListProduct(res);
        });
    }, []);

    return (
        <>
        {/* <Header/> */}
            <div className={container}>
                <MainLayout>
                    {/* <Header /> */}
                    <Banner />
                    <InfoSection />
                    <AdvanceHeading />
                    <ListProduct data={listProduct.slice(0, 2)} />
                    <PopularProduct data={listProduct.slice(2, 10)} />
                    <ScrollBanner />
                    {/* <Footer /> */}
                </MainLayout>
            </div>
        </>
    );
}

export default HomePage;
