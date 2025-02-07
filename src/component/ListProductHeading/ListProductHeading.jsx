
import ProductItems from "@component/ProductItems/ProductItems";
import styles from "./stylesListProduct.module.scss";
import CountDownBanner from "@component/CountDownBanner/CountDountBanner";

function ListProduct() {
      
    const { container, wrapContent, containerItems } = styles;
    return (
        <div className={wrapContent}>
            <div className={container}>
                <div>
                   
                    <CountDownBanner />
                </div>
                <div className={containerItems}>
                    <ProductItems/>
                    <ProductItems/>
                    
                </div>
            </div>
        </div>
    );
}

export default ListProduct;
