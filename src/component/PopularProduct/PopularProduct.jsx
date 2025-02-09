import ProductItems from "@component/ProductItems/ProductItems";
import styles from "./styles.module.scss";
import MainLayout from "@component/Layout/Layout.jsx";
function PopularProduct({ data }) {
    const { container, wrapContent } = styles;
    return (
        <>
            <div className={wrapContent}>
                <div className={container}>
                    {data.map((item) => {
                        return (
                            <ProductItems
                                key={item.id}
                                src={item.src}
                                prevSrc={item.prevSrc}
                                name={item.name}
                                price={item.price}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default PopularProduct;
