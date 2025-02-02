import { useState,useEffect } from "react";
import BoxIcon from "./BoxIcon/BoxIcon";
import { dataBoxIcon, dataMenu } from "./constant";
import Menu from "./Menu/Menu";
import styles from "./stylesHeader.module.scss";
import LogoWeb from "@Images/LogoWeb.png";
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
        menuItems
    } = styles;

   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth <= 828);

   const handleMenuToggle = () => {
       setIsMenuOpen((prevState) => !prevState);
   };

   // Detect screen size changes and update state
   useEffect(() => {
       const handleResize = () => {
           setIsScreenSmall(window.innerWidth <= 828);
           if (window.innerWidth > 828) {
               setIsMenuOpen(false); // Close menu on large screens
               
           }
       };

       window.addEventListener("resize", handleResize);
       console.log("menu is open");
       return () => {
           window.removeEventListener("resize", handleResize);
           
       };
   }, []);

    return (
        <nav className={containerHeader}>
            <div className={containerMenuBox}>
                <div className={containerFlexItems}>
                    {dataBoxIcon.slice(0, 1).map((items) => {
                        return <BoxIcon type={items.type} href={items.href} />;
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
                    {dataBoxIcon.slice(1, 3).map((items) => {
                        return <BoxIcon type={items.type} href={items.href} />;
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
                    {dataMenu.map((items) => (
                        <li>
                            {" "}
                            <Menu
                                key={items.content}
                                content={items.content}
                                href={items.href}
                            />
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
