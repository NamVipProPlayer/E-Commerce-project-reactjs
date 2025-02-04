import MainLayout from "@component/Layout/Layout";
import Header from "@component/Header/Header";
import Banner from "@component/Banner/Banner";
import styles from "./HomePage.module.scss";

function HomePage() {
    const {container}=styles;
    return (
        <div>
            <MainLayout>
                <Header />
                <Banner />
            </MainLayout>
        </div>
    );
}

export default HomePage;
