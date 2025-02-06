import MainLayout from "@component/Layout/Layout";
import Header from "@component/Header/Header";
import Banner from "@component/Banner/Banner";
import styles from "./HomePage.module.scss";
import InfoSection from "@component/SectionInfo/InfoSection";
import AdvanceHeading from "@component/AdvanceHeading/AdvanceHeading";
function HomePage() {
    const {container}=styles;
    return (
        <div className={container}>
            <MainLayout>
                <Header />
                <Banner />
                <InfoSection />
                <AdvanceHeading/>
            </MainLayout>
        </div>
    );
}

export default HomePage;
