import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@Contexts/AuthContext";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { StorageContext } from "@Contexts/StorageProvider.jsx"; // Add this import
import cartService from "@apis/cartService"; // Add this import
import wishlistService from "@apis/wishlistService"; // Add this import
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
import { set } from "react-hook-form";

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
    const { auth, setAuth } = useContext(AuthContext);
    const { isMenuOpen, isScreenSmall, handleMenuToggle } =
        useTrackingSizeScr();
    const isHidden = useHideOnScroll();

    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const { userInfo } = useContext(StorageContext);
    const isAuthenticated = !!auth?.token;

    // Fetch cart and wishlist counts
    useEffect(() => {
        const fetchCounts = async () => {
            if (isAuthenticated) {
                try {
                    // Fetch cart count
                    const cartResponse = await cartService.getCart();
                    if (cartResponse && cartResponse.items) {
                        setCartCount(cartResponse.items.length);
                    }

                    // Fetch wishlist count
                    const wishlistResponse =
                        await wishlistService.getWishlist();
                    console.log("Wishlist response:", wishlistResponse);

                    // Check if response has products array
                    if (
                        wishlistResponse &&
                        wishlistResponse.products &&
                        Array.isArray(wishlistResponse.products)
                    ) {
                        setWishlistCount(wishlistResponse.products.length);
                    } else if (
                        wishlistResponse &&
                        Array.isArray(wishlistResponse)
                    ) {
                        // Fallback for array response format
                        setWishlistCount(wishlistResponse.length);
                    } else {
                        console.warn(
                            "Unexpected wishlist format:",
                            wishlistResponse
                        );
                        setWishlistCount(0);
                    }
                } catch (error) {
                    console.error("Error fetching counts:", error);
                }
            } else {
                // Reset counts when logged out
                setCartCount(0);
                setWishlistCount(0);
            }
        };

        fetchCounts();

        // Optional: Setup interval to refresh counts periodically
        const intervalId = setInterval(fetchCounts, 3000); // Refresh every minute

        return () => clearInterval(intervalId);
    }, [isAuthenticated]);

    const handleOpenSideBar = (type) => {
        setIsOpen(true);
        setType((prevTpye) => {
            // console.log("Previous type:", prevType);
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
                        <FaFacebook size={"1.5rem"} color="#000" />
                    </a>
                    <a
                        href="https://www.instagram.com/nam.map.7739/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={"1.5rem"} color="#000" />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/van-nam-ly-4b8889332/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin size={"1.5rem"} color="#000" />
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
