import { Card, CardContent } from "@component/ui/Card/Card.jsx";
import { Badge } from "@component/ui/Badge/Badge.jsx";
import styles from "./stylesProductCart.module.scss";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID").format(price);
    };

    const handleClick = () => {
        navigate(`/product/${product._id}`);
    };

    // Calculate sale price if product has a sale discount
    const hasSale = product.sale && product.sale > 0;
    const salePrice = hasSale
        ? product.price - (product.price * product.sale) / 100
        : null;

    return (
        <Card className={styles.card} onClick={handleClick}>
            <CardContent className={styles.content}>
                <div className={styles.imageContainer}>
                    <img src={product.fSrc} alt={product.name} />
                    {product.bestSeller && (
                        <Badge variant="destructive" className={styles.badge}>
                            Bestseller
                        </Badge>
                    )}
                    {product.isComingSoon && (
                        <Badge variant="secondary" className={styles.badge}>
                            Coming Soon
                        </Badge>
                    )}
                    {hasSale && (
                        <Badge variant="outline"  className={styles.saleBadge}>
                            {product.sale}% OFF
                        </Badge>
                    )}
                </div>
                <div className={styles.details}>
                    <h3>{product.name}</h3>
                    <p className={styles.category}>{product.category}</p>
                    <p className={styles.color}>{product.colors?.join(", ")}</p>

                    <div className={styles.priceContainer}>
                        {hasSale ? (
                            <>
                                <p className={styles.originalPrice}>
                                    ${formatPrice(product.price)}
                                </p>
                                <p className={styles.salePrice}>
                                    ${formatPrice(salePrice)}
                                </p>
                            </>
                        ) : (
                            <p className={styles.price}>
                                ${formatPrice(product.price)}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
