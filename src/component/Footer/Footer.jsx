import { dataMenu } from "@component/Header/constant";
import styles from "./stylesFooter.module.scss";
import { SlPaypal } from "react-icons/sl";
import { LiaCcVisa, LiaCcAmazonPay, LiaAmazon } from "react-icons/lia";
function Footer() {
    const {
        container,
        title,
        listStyle,
        boxIcon,
        textContainer,
        checkoutContent
    } = styles;

    return (
        <footer className={container}>
            <div className={title}>
                <p>N&M store</p>
            </div>
            <div>
                <ul className={listStyle}>
                    {dataMenu.map((items, index) => {
                        return <li key={index}>{items.content}</li>;
                    })}
                </ul>
            </div>

            <div className={checkoutContent}>
                <p>Guaranteed safe checkout</p>
                <div className={boxIcon}>
                    <SlPaypal size={"1.5rem"} />
                    <LiaCcVisa size={"1.5rem"} />
                    <LiaAmazon size={"1.5rem"} />
                </div>
            </div>
            <div className={textContainer}>
                <p>
                    Copyright &#169; 2025 N&M store. Create by Nam and his
                    friend
                </p>
            </div>
        </footer>
    );
}

export default Footer;
