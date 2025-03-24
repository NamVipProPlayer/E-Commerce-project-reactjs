import styles from "../stylesHeader.module.scss";
import heartIcon from "@Icons/svgs/heart.svg";
import bagicon from "@Icons/svgs/handbag.svg";
import searchIcon from "@Icons/svgs/search.svg";
import { CiHeart } from "react-icons/ci";
function BoxIcon({ type, href }) {
    const { boxIcon } = styles;
    const handleRender = (type) => {
        switch (type) {
            case "Fav":
                return heartIcon;
            case "BagItems":
                return bagicon;
            case "Search":
                return searchIcon;
        }
    };
    return (
        <div className={boxIcon}>
            <img src={handleRender(type)} alt="logo" />
        </div>
    );
}

export default BoxIcon;
