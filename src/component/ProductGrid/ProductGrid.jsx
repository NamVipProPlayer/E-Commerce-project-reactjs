import Skeleton from "@component/ui/Skeleton/Skeleton.jsx";
import ProductCard from "@component/ProductCart/ProductCart.jsx";
import styles from "./stylesProductGird.module.scss";

export default function ProductGrid({ products, isLoading }) {
    // console.log("Products in ProductGrid:", JSON.stringify(products, null, 2));

    if (isLoading) {
        return (
            <div className={styles.grid}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.skeleton}>
                        <Skeleton style={{ height: "300px", width: "100%" }} />
                        <Skeleton
                            style={{
                                height: "16px",
                                width: "66%",
                                marginTop: "16px"
                            }}
                        />
                        <Skeleton
                            style={{
                                height: "16px",
                                width: "50%",
                                marginTop: "8px"
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}
