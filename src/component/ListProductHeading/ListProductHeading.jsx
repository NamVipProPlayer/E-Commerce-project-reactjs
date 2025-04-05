import ProductItems from "@component/ProductItems/ProductItems";
import styles from "./stylesListProduct.module.scss";
import CountDownBanner from "@component/CountDownBanner/CountDountBanner";

function ListProduct({ data }) {
    const { container, wrapContent, containerItems, countDown } = styles;
console.log("check data best seller",data);
   
    return (
        <div className={wrapContent}>
            <div className={container}>
                <div className={countDown}>
                    <CountDownBanner />
                </div>
                <div className={containerItems}>
                    {data.map((item,index) => {
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
        </div>
    );
}

export default ListProduct;
