import styles from "../stylesHeader.module.scss";

function Menu({ content, href }) {
    const { menuhover } = styles;
    return <div className={menuhover}>{content}</div>;  
}

export default Menu;
