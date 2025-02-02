import MainLayout from "@component/Layout/Layout";
import Header from "@component/Header/Header";
import Banner from "@component/Banner/Banner";

function HomePage() {
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