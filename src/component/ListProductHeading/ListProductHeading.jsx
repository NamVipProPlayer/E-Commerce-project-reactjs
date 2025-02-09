import ProductItems from "@component/ProductItems/ProductItems";
import styles from "./stylesListProduct.module.scss";
import CountDownBanner from "@component/CountDownBanner/CountDountBanner";

function ListProduct({ data }) {
    const { container, wrapContent, containerItems } = styles;

    console.log(data);
    return (
        <div className={wrapContent}>
            <div className={container}>
                <div>
                    <CountDownBanner />
                </div>
                <div className={containerItems}>
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
        </div>
    );
}

export default ListProduct;
