import styles from "./styles.module.scss";
import Srollbanner1 from "@Images/nike-just-do-it.png";
import Scrollbanner2 from "@Images/nike-just-do-it (1).png";
import useTranslateX from "@component/ScrollBanner/translateImageX";

function ScrollBanner() {
    const { translateXPosition } = useTranslateX();


    const { container, imgContainer, containerContent, btn_buy } = styles;

    return (
        <div className={container}>
            <div
                className={imgContainer}
                style={{
                    transform: `translateX(${translateXPosition}px)`,
                    transition: "transform 500ms ease"
                }}
            >
                <img src={Srollbanner1} alt="Scroll Banner" />
            </div>
            <div className={containerContent}>
                <h2>Sale of the year</h2>
                <p>You can't ban greatness</p>
                <button className={btn_buy}>Shop</button>
            </div>
            <div
                className={imgContainer}
                style={{
                    transform: `translateX(-${translateXPosition}px)`,
                    transition: "transform 500ms ease"
                }}
            >
                <img src={Scrollbanner2} alt="Scroll Banner" />
            </div>
        </div>
    );
}

export default ScrollBanner;
