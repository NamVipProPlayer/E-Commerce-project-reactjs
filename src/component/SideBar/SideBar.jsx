import { useContext, useEffect, useState, useRef } from "react";
import styles from "./stylesSideBar.module.scss";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import classNames from "classnames";
import LoginUI from "@component/SideBarContent/LoginUI/LoginUI";
import ShoppingCart from "@component/SideBarContent/ShopingCart/ShopingCart";
import Wishlist from "@component/SideBarContent/Wishlist/Wishlist";
import wishlistService from "@apis/wishlistService.js";
import cartService from "@apis/cartService.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function SideBar() {
    const { SideBar, overlayContainer, container, sideBarOpen } = styles;
    const { isOpen, setIsOpen, setType, type } = useContext(SideBarContext);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigatingRef = useRef(false);

    // Check if user is authenticated
    const isAuthenticated = !!auth?.token;

    // Fetch Wishlist with loading state
    const fetchWishlist = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await wishlistService.getWishlist();
            setWishlist(data.products || []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            toast.error("Failed to load wishlist items");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch Cart with loading state
    const fetchCart = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await cartService.getCart();
            setCart(data.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            toast.error("Failed to load cart items");
        } finally {
            setIsLoading(false);
        }
    };

    // Delete Product from Wishlist
    const handleDeleteFromWishlist = async (productId) => {
        try {
            await wishlistService.removeFromWishlist(productId);
            setWishlist((prevWishlist) =>
                prevWishlist.filter((item) => item.product._id !== productId)
            );
            toast.success("Item removed from wishlist");
        } catch (error) {
            console.error("Error removing product from wishlist:", error);
            toast.error("Failed to remove item from wishlist");
        }
    };

    // Delete Product from Cart
    const handleDeleteFromCart = async (productId, size) => {
        try {
            await cartService.removeFromCart(productId, size);
            setCart((prevCart) =>
                prevCart.filter(
                    (item) =>
                        !(item.product._id === productId && item.size === size)
                )
            );
            toast.success("Item removed from cart");
        } catch (error) {
            console.error("Error removing product from cart:", error);
            toast.error("Failed to remove item from cart");
        }
    };

    // Check authentication and redirect if needed
    useEffect(() => {
        if (
            isOpen &&
            !isAuthenticated &&
            (type === "wishlist" || type === "shopingcart")
        ) {
            toast.info("Please sign in to continue", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });
            setType("Sign In");
        }
    }, [isOpen, type, isAuthenticated, setType]);

    // Fetch data when sidebar is opened or type changes
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            if (type === "wishlist") fetchWishlist();
            if (type === "shopingcart") fetchCart();
        }
    }, [isOpen, type, isAuthenticated]);

    // Fixed: Handle category navigation - prevent sidebar from showing up after navigation
    useEffect(() => {
        // Check if type is Men or Women and we're not already navigating
        if ((type === "Men" || type === "Women") && !navigatingRef.current) {
            const category = type === "Men" ? "Man's Shoes" : "Women's shoes";

            // Set navigating flag to prevent re-processing
            navigatingRef.current = true;

            // Close the sidebar immediately before navigation
            setIsOpen(false);

            // Use setTimeout to ensure the sidebar closes before navigating
            setTimeout(() => {
                navigate("/OurStore", {
                    state: { category }
                });

                // Reset the type after navigation completes
                setTimeout(() => {
                    setType("");
                    navigatingRef.current = false;
                }, 100);
            }, 50);
        }
    }, [type, navigate, setIsOpen, setType]);

    const handleMenuToggle = () => {
        setIsOpen(false); // Close the sidebar when overlay is clicked
    };

    const handleRenderSidebarContent = () => {
        switch (type) {
            case "Sign In":
                return <LoginUI />;
            case "Find a store":
                return "Store Locator Coming Soon";
            case "Men":
            case "Women":
                return (
                    <div className={styles.redirectingMessage}>
                        Redirecting to {type}'s shoes...
                    </div>
                );
            case "wishlist":
                return isAuthenticated ? (
                    <Wishlist
                        wishlist={wishlist}
                        onDelete={handleDeleteFromWishlist}
                        isLoading={isLoading}
                    />
                ) : (
                    <LoginUI />
                );
            case "shopingcart":
                return isAuthenticated ? (
                    <ShoppingCart
                        cart={{ items: cart }}
                        onDelete={handleDeleteFromCart}
                        isLoading={isLoading}
                    />
                ) : (
                    <LoginUI />
                );
            default:
                return <div>Content not available</div>;
        }
    };

    return (
        <div className={container}>
            {/* Overlay background */}
            <div
                className={classNames({
                    [overlayContainer]: isOpen
                })}
                onClick={handleMenuToggle}
            ></div>

            {/* Sidebar content */}
            <div className={classNames(SideBar, { [sideBarOpen]: isOpen })}>
                {handleRenderSidebarContent()}
            </div>
        </div>
    );
}

export default SideBar;
