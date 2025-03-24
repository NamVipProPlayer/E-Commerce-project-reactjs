import { useEffect, useState } from "react";
import MainLayout from "@component/Layout/Layout.jsx";
import styles from "@component/SectionInfo/stylesInfoSection.module.scss";
import CardSection from "@component/SectionInfo/CardSection/CardSection";
import { DataSecInFo } from "@component/SectionInfo/constantData";

function InfoSection() {
    const { wrapLayout, containerSection, container } = styles;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 1255 : false
    );

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1255);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto-cycle only in mobile mode
    useEffect(() => {
        if (isMobile) {
            const interval = setInterval(() => {
                setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % DataSecInFo.length
                );
            }, 4000);

            return () => clearInterval(interval);
        }
    }, [isMobile]);

    return (
        <div className={wrapLayout}>
            <section className={containerSection}>
                <div className={container}>
                    {DataSecInFo.map((items, index) => {
                        // Show all cards on larger screens, only one card on mobile
                        const isActive = isMobile
                            ? index === currentIndex
                            : true;

                        return isActive ? (
                            <CardSection
                                key={index}
                                title={items.title}
                                description={items.description}
                                href={items.href}
                                src={items.src}
                                active={index === currentIndex}
                            />
                        ) : null;
                    })}
                </div>
            </section>
        </div>
    );
}

export default InfoSection;
