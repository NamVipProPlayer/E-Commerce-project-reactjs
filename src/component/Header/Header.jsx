import BoxIcon from "./BoxIcon/BoxIcon";
import { dataBoxIcon, dataMenu } from "./constant";
import Menu from "./Menu/Menu";
import styles from "./stylesHeader.module.scss";
import LogoWeb from "@Images/LogoWeb.png";
import useTrackingSizeScr from "@Hooks/useTrackingSizeScr.js";
import useHideOnScroll from "@Hooks/useHideOnScroll.js";

function Header() {
    const {
        containerFlexItems,
        containerMenu,
        containerHeader,
        containerMenuBox,
        menuIcon,
        menuIconContainer,
        imgLogo,
        menuOpen,
        menuOpenActive,
        menuOverlay,
        menuItems,
        menuHidden
    } = styles;

    const { isMenuOpen, isScreenSmall, handleMenuToggle } =
        useTrackingSizeScr();
    const isHidden = useHideOnScroll();

    return (
        <nav className={`${containerHeader} ${isHidden ? menuHidden : ""}`}>
            <div className={containerMenuBox}>
                <div className={containerFlexItems}>
                    {dataBoxIcon.slice(0, 1).map((items, index) => {
                        return (
                            <BoxIcon
                                type={items.type}
                                href={items.href}
                                key={index}
                            />
                        );
                    })}
                </div>
                <div
                    className={`${containerMenu} ${isMenuOpen ? menuOpen : ""}`}
                >
                    {dataMenu.slice(0, 4).map((items) => (
                        <Menu
                            key={items.content}
                            content={items.content}
                            href={items.href}
                        />
                    ))}
                </div>
            </div>
            <div>
                <img src={LogoWeb} alt="Logo" className={imgLogo} />
            </div>
            <div className={containerMenuBox}>
                <div
                    className={`${containerMenu} ${isMenuOpen ? menuOpen : ""}`}
                >
                    {dataMenu.slice(4).map((items) => (
                        <Menu
                            key={items.content}
                            content={items.content}
                            href={items.href}
                        />
                    ))}
                </div>
                <div className={containerFlexItems}>
                    {dataBoxIcon.slice(1, 3).map((items, index) => {
                        return (
                            <BoxIcon
                                type={items.type}
                                href={items.href}
                                key={index}
                            />
                        );
                    })}
                </div>
            </div>
            {isScreenSmall && (
                <div className={menuIconContainer} onClick={handleMenuToggle}>
                    <div className={menuIcon}></div>
                    <div className={menuIcon}></div>
                    <div className={menuIcon}></div>
                </div>
            )}
            <div className={`${menuOpen} ${isMenuOpen ? menuOpenActive : ""}`}>
                <ul className={menuItems}>
                    {dataMenu.map((items, index) => (
                        <li key={index}>
                            {" "}
                            <Menu content={items.content} href={items.href} />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Overlay */}
            {isMenuOpen && (
                <div className={menuOverlay} onClick={handleMenuToggle}></div>
            )}
        </nav>
    );
}

export default Header;
