import MainLayout from "@component/Layout/Layout";
import styles from "../Banner/stylesAdvanceHeading.module.scss";
function AdvanceHeading() {
    const { container, headline, containerMidBox, des, title } = styles;
    return (
        <MainLayout>
            <div className={container}>
                <div className={headline}></div>
                <div className={containerMidBox}>
                    <p className={des}>Don't miss supper offer</p>
                    <p className={title}>Our Best Seller</p>
                </div>
                <div className={headline}></div>
            </div>
        </MainLayout>
    );
}

export default AdvanceHeading;
