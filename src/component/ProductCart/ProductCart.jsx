import { Card, CardContent } from "@component/ui/Card/Card.jsx";
import { Badge } from "@component/ui/Badge/Badge.jsx";
import styles from "./stylesProductCart.module.scss";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
 const navigate = useNavigate(); // Use react-router-dom's navigate

 const formatPrice = (price) => {
     return new Intl.NumberFormat("id-ID").format(price);
 };

 const handleClick = () => {
     navigate(`/product/${product._id}`); // Use navigate instead of setLocation
 };
//   console.log("Product data in card:", product);

    return (
        <Card className={styles.card} onClick={handleClick}>
            <CardContent className={styles.content}>
                <div className={styles.imageContainer}>
                    <img src={product.fSrc} alt={product.name} />
                    {product.isBestseller && (
                        <Badge variant="secondary" className={styles.badge}>
                            Bestseller
                        </Badge>
                    )}
                    {product.isComingSoon && (
                        <Badge variant="secondary" className={styles.badge}>
                            Coming Soon
                        </Badge>
                    )}
                </div>
                <div className={styles.details}>
                    <h3>{product.name}</h3>
                    <p className={styles.category}>{product.category}</p>
                    <p className={styles.color}>{product.colors?.join(", ")}</p>
                    <p className={styles.price}>
                        {formatPrice(product.price)} $
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
