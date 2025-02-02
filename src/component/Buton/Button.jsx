import classNames from "classnames";
import styles from "./Button.module.scss";
function Button() {
    
    return (
        <div>
            <button className={styles.btn_default}>XL</button>
            <button className={styles.btn_heart}>M</button>
            <button className={styles.btn_add}>Add to cart</button>
            <button className={styles.btn_buy}>Add to cart</button>
        
        </div>
    );
}

export default Button;
