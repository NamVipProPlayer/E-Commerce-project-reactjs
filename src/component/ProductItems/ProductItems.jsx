import styles from "./stylesProductItems.module.scss";
import bestsell from "@Images/bestSeller.png";
import bestsellZoom from "@Images/bestSellZoom.jpg";
import eyeIcon from "@Icons/svgs/eyeIcon.svg";
import heartIcon from "@Icons/svgs/heart.svg";
import bagIcon from "@Icons/svgs/handbag.svg";

function ProductItems({ src, prevSrc, name, price }) {
    const {
        imgItems,
        showHover,
        showSidebarItemHover,
        containerIcon,
        itemPrice,
        itemName
    } = styles;

    return (
        <div>
            <div className={imgItems}>
                <img src={bestsell} alt="Best Seller" />
                <img
                    src="https://raw.githubusercontent.com/NamVipProPlayer/backendIMG/main/images/bestSellZoom.jpg"

                    alt="Best Seller Zoom"
                    className={showHover}
                />

                <div className={showSidebarItemHover}>
                    <div className={containerIcon}>
                        <img src={heartIcon} alt="Add to Wishlist" />
                    </div>
                    <div className={containerIcon}>
                        <img src={bagIcon} alt="Add to Cart" />
                    </div>
                    <div className={containerIcon}>
                        <img src={eyeIcon} alt="View Details" />
                    </div>
                </div>
            </div>
            <div className={itemName}>Nike Free Metcon 6</div>
            <div className={itemPrice}>66$</div>
        </div>
    );
}

export default ProductItems;
