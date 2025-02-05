import MainLayout from "@component/Layout/Layout.jsx";
import styles from "@component/SectionInfo/stylesInfoSection.module.scss";
import CardSection from "@component/SectionInfo/CardSection/CardSection";
import { DataSecInFo } from "@component/SectionInfo/constantData";
function InfoSection() {
    const { wrapLayout, containerSection, container } = styles;
    return (
        <div className={wrapLayout}>
            <MainLayout className={containerSection}>
                <div className={container}>
                    {DataSecInFo.map((items) => {
                        return (
                            <CardSection
                                title={items.title}
                                description={items.description}
                                href={items.href}
                                src={items.src}
                            />
                        );
                    })}
                </div>
            </MainLayout>
        </div>
    );
}

export default InfoSection;
