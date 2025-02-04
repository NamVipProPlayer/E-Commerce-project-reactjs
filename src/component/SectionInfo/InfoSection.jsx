import MainLayout from "@component/Layout/Layout.jsx";
import styles from "@component/Layout/stylesLayout.module.scss";
function InfoSection() {
    const { wrapLayout, containerSection } = styles;
    return (
        <div className={wrapLayout}>
            <MainLayout className={containerSection}>
                <div>
                    
                </div>
            </MainLayout>
        </div>
    );
}

export default InfoSection;
