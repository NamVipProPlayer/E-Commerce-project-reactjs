import { CiHeart } from "react-icons/ci";
import styles from "./stylesWishlist.module.scss";
import ItemProduct from "@component/SideBarContent/Wishlist/ItemProduct/ItemProduct";

function Wishlist({ wishlist, onDelete }) {
    const {
        container,
        titleContainer,
        containerBox,
        itemsContainer,
        fadeContainer
    } = styles;

    return (
        <div className={container}>
            <div className={containerBox}>
                <div>
                    <CiHeart size={"2rem"} />
                </div>
                <div className={titleContainer}>Wish List</div>
                <div className={fadeContainer}>
                    <div className={itemsContainer}>
                        {wishlist.length > 0 ? (
                            wishlist.map((item) => (
                                <ItemProduct
                                    key={item.product._id}
                                    product={item.product}
                                    onDelete={onDelete}
                                />
                            ))
                        ) : (
                            <p>No items in wishlist</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Wishlist;
