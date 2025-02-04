import styles from "../stylesBanner.module.scss";
import Banner4 from "@Images/banner4.jpg";
import Banner from "@Images/banner.jpg";
import Banner3 from "@Images/banner3.jpg";
import Banner2 from "@Images/banner2.jpg";

function AutoSlider({ type }) {
    const { containerSlider } = styles;

    const handleSlider = (type) => {
        switch (type) {
            case "banner4":
                return Banner4;
            case "banner":
                return Banner;
            case "banner3":
                return Banner3;
            case "banner2":
                return Banner2;
            default:
                return Banner; // fallback in case of an invalid type
        }
    };

    return (
        <div className={containerSlider}>
            <img src={handleSlider(type)} alt="Slider" />
        </div>
    );
}

export default AutoSlider;
