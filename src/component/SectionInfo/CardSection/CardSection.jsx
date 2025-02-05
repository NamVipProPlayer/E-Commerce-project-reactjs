import styles from "../stylesInfoSection.module.scss";
import truckIcon from "@Icons/svgs/truck.svg";
import debitIcon from "@Icons/svgs/debitcardIcon.svg";
import boxIcon from "@Icons/svgs/boxicon.svg";
import headphoneIcon from "@Icons/svgs/headphoneIcon.svg";
function CardSection({ title, description, href, src }) {
    const { containerCard, containerSpan, titles, des } = styles;
    return (
        <div className={containerCard}>
            <img src={src} alt="truckIcon" />
            <div className={containerSpan}>
                <span className={titles}>{title}</span>
                <span className={des}>{description}</span>
            </div>
        </div>
    );
}

export default CardSection;
