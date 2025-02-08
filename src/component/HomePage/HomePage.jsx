import MainLayout from "@component/Layout/Layout";
import Header from "@component/Header/Header";
import Banner from "@component/Banner/Banner";
import styles from "./HomePage.module.scss";
import InfoSection from "@component/SectionInfo/InfoSection";
import AdvanceHeading from "@component/AdvanceHeading/AdvanceHeading";
import ListProduct from "@component/ListProductHeading/ListProductHeading";
import { getProduct } from "@/apis/productService.js";
import { useEffect } from "react";
function HomePage() {
    const { container } = styles;
    useEffect(() => {
        getProduct;
    }, []);

    return (
        <div className={container}>
            <MainLayout>
                <Header />
                <Banner />
                <InfoSection />
                <AdvanceHeading />
                <ListProduct />
            </MainLayout>
        </div>
    );
}

export default HomePage;
