import BoxIcon from "./BoxIcon/BoxIcon";
import { dataBoxIcon, dataMenu } from "./constant";
import Menu from "./Menu/Menu";
import styles from "./stylesHeader.module.scss";
import LogoWeb from "@Icons/images/LogoWeb.png";
function Header() {
    const { containerFlexItems, containerMenu, containerHeader } = styles;
    return (
        <div className={containerHeader}>
            <div className={containerMenu}>
                <div className={containerFlexItems}>
                    {dataBoxIcon.slice(0, 1).map((items) => {
                        return <BoxIcon type={items.type} href={items.href} />;
                    })}
                </div>
                <div className={containerMenu}>
                    {dataMenu.slice(0, 4).map((items) => {
                        return (
                            <Menu content={items.content} href={items.href} />
                        );
                    })}
                </div>
            </div>
            <div>
                <img
                    src={LogoWeb}
                    alt="Logo"
                    style={{
                        width: "153px",
                        height: "70px",
                        marginTop: "10px",
                        marginBottom: "5px"
                    }}
                />
            </div>
            <div className={containerMenu}>
                <div className={containerMenu}>
                    {dataMenu.slice(4, dataMenu.length).map((items) => {
                        return (
                            <Menu content={items.content} href={items.href} />
                        );
                    })}
                </div>
                <div className={containerFlexItems}>
                    {dataBoxIcon.slice(1, 3).map((items) => {
                        return <BoxIcon type={items.type} href={items.href} />;
                    })}
                </div>
            </div>
        </div>
    );
}

export default Header;
