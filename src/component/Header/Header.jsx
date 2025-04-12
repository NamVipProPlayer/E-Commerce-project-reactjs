import { useContext } from "react";
import { AuthContext } from "@Contexts/AuthContext";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
// import useCountsFetcher from "@Hooks/useCountsFecher.js"; // Import our new hook
import { dataMenu } from "./constant";
import Menu from "./Menu/Menu";
import styles from "./stylesHeader.module.scss";
import LogoWeb from "@Images/LogoWeb.png";
import useTrackingSizeScr from "@Hooks/useTrackingSizeScr.js";
import useHideOnScroll from "@Hooks/useHideOnScroll.js";
import { CiHeart } from "react-icons/ci";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa"; // Added social media icons
import { useNavigate } from "react-router-dom";
import { CountsContext } from "@Contexts/CountContext.jsx";

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
        menuHidden,
        socialIcons
    } = styles;

    const navigate = useNavigate();
    const { isOpen, setIsOpen, setType } = useContext(SideBarContext);
    const { auth } = useContext(AuthContext);
    const { isMenuOpen, isScreenSmall, handleMenuToggle } =
        useTrackingSizeScr();
    const isHidden = useHideOnScroll();
    const { userInfo } = useContext(StorageContext);
    const { cartCount, wishlistCount } = useContext(CountsContext);

    const handleOpenSideBar = (type) => {
        setIsOpen(true);
        setType((prevType) => {
            console.log("New type:", type);
            return type;
        });
    };

    return (
        <nav className={`${containerHeader} ${isHidden ? menuHidden : ""}`}>
            <div className={containerMenuBox}>
                <div className={containerFlexItems}>
                    {/* Social media icons with black color */}
                    <a
                        href="https://www.facebook.com/nam.map.7739/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                    >
                        <FaFacebook size={"1rem"} color="#000" />
                    </a>
                    <a
                        href="https://www.instagram.com/nam.map.7739/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={"1rem"} color="#000" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/van-nam-ly-4b8889332/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin size={"1rem"} color="#000" />
                    </a>
                </div>
                <div
                    className={`${containerMenu} ${isMenuOpen ? menuOpen : ""}`}
                >
                    {dataMenu.slice(0, 3).map((items) => (
                        <Menu
                            key={items.content}
                            content={items.content}
                            href={items.href}
                            setIsOpen={setIsOpen}
                            setType={setType}
                        />
                    ))}
                </div>
            </div>
            <div>
                <img
                    src={LogoWeb}
                    alt="Logo"
                    className={imgLogo}
                    onClick={() => {
                        navigate("/");
                    }}
                />
            </div>
            <div className={containerMenuBox}>
                <div
                    className={`${containerMenu} ${isMenuOpen ? menuOpen : ""}`}
                >
                    {dataMenu.slice(3, dataMenu.length).map((items) => (
                        <Menu
                            key={items.content}
                            content={items.content}
                            href={items.href}
                            setIsOpen={setIsOpen}
                            setType={setType}
                        />
                    ))}
                </div>
                <div className={containerFlexItems}>
                    <div className={styles.iconWithBadge}>
                        <CiHeart
                            size={"1.6rem"}
                            onClick={() => {
                                handleOpenSideBar("wishlist");
                            }}
                        />
                        {wishlistCount > 0 && (
                            <span className={styles.badge}>
                                {wishlistCount}
                            </span>
                        )}
                    </div>

                    <div className={styles.iconWithBadge}>
                        <HiOutlineShoppingBag
                            size={"1.5rem"}
                            onClick={() => {
                                handleOpenSideBar("shopingcart");
                            }}
                        />
                        {cartCount > 0 && (
                            <span className={styles.badge}>{cartCount}</span>
                        )}
                    </div>
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
                            <Menu
                                content={items.content}
                                href={items.href}
                                setIsOpen={setIsOpen}
                                setType={setType}
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
