import classNames from "classnames";
import styles from "./Button.module.scss";
function Button({content}) {
    const { btn_default } = styles;
    return <button className={btn_default}>{content}</button>;
}

export default Button;
