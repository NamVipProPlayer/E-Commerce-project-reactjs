import classNames from "classnames";
import styles from "./Button.module.scss";
function Button({ content, onClick }) {
    const { btn_default } = styles;
    return (
        <button className={btn_default} onClick={onClick}>
            {content}
        </button>
    );
}

export default Button;
