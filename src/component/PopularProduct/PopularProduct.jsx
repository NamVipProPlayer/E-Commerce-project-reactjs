import ProductItems from "@component/ProductItems/ProductItems";
import styles from "./styles.module.scss";


function PopularProduct({ data }) {
    const { container, wrapContent } = styles;

    return (
        <>
            <div className={wrapContent}>
                <div className={container}>
                    {data.map((item, index) => {
                        return (
                            <ProductItems
                                key={item.id || index}
                                product={item}
                                itemId={item._id}
                                src={item.fSrc}
                                prevSrc={item.sSrc}
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
