import styles from "../stylesInfoSection.module.scss";

function CardSection({ title, description, href, src, active }) {
    const { containerCard, containerSpan, titles, des } = styles;

    return (
        <div className={`${containerCard} ${active ? "active" : "inactive"}`}>
            <img className="imgIcons" src={src} alt={title} />
            <div className={containerSpan}>
                <span className={titles}>{title}</span>
                <span className={des}>{description}</span>
            </div>
        </div>
    );
}

export default CardSection;
