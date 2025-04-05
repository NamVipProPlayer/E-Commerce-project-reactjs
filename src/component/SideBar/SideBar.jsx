import { useContext, useEffect, useState, useRef } from "react";
import styles from "./stylesSideBar.module.scss";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { CountsContext } from "@Contexts/CountContext.jsx"; // Import CountsContext
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

    // Get counts update functions from CountsContext
    const { decrementWishlistCount, decrementCartCount, fetchCounts } =
        useContext(CountsContext);

    // Check if user is authenticated
    const isAuthenticated = !!auth?.token;

    // Fetch Wishlist with loading state
    const fetchWishlist = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await wishlistService.getWishlist();
            setWishlist(data.products || []);
            // Refresh counts to ensure they're accurate
            fetchCounts();
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
            // Refresh counts to ensure they're accurate
            fetchCounts();
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
            // First update UI immediately
            setWishlist((prevWishlist) =>
                prevWishlist.filter((item) => item.product._id !== productId)
            );

            // Update count immediately for responsive UI
            decrementWishlistCount();

            // Then perform API call
            await wishlistService.removeFromWishlist(productId);
            toast.success("Item removed from wishlist");
        } catch (error) {
            console.error("Error removing product from wishlist:", error);
            toast.error("Failed to remove item from wishlist");

            // Refresh data in case of error
            fetchWishlist();
            fetchCounts();
        }
    };

    // Delete Product from Cart
    const handleDeleteFromCart = async (productId, size) => {
        try {
            // First update UI immediately
            setCart((prevCart) =>
                prevCart.filter(
                    (item) =>
                        !(item.product._id === productId && item.size === size)
                )
            );

            // Update count immediately for responsive UI
            decrementCartCount();

            // Then perform API call
            await cartService.removeFromCart(productId, size);
            toast.success("Item removed from cart");
        } catch (error) {
            console.error("Error removing product from cart:", error);
            toast.error("Failed to remove item from cart");

            // Refresh data in case of error
            fetchCart();
            fetchCounts();
        }
    };

    // Update quantity in cart
    const handleUpdateCartQuantity = async (productId, size, quantity) => {
        try {
            await cartService.updateCartItemQuantity(productId, size, quantity);

            // Update local cart data
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.product._id === productId && item.size === size
                        ? { ...item, quantity }
                        : item
                )
            );

            // No need to update count since item count doesn't change,
            // just the quantity of an existing item

            toast.success("Quantity updated");
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update quantity");
            fetchCart();
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
        // Check if type is Men, Women, or Sale and we're not already navigating
        if ((type === "Men" || type === "Women" || type === "Sale") && !navigatingRef.current) {
            let navigationState = {};
            
            if (type === "Men") {
                navigationState = { category: "Man's Shoes" };
            } else if (type === "Women") {
                navigationState = { category: "Women's shoes" };
            } else if (type === "Sale") {
                navigationState = { onSale: true }; // Special state for sale items
            }

            // Set navigating flag to prevent re-processing
            navigatingRef.current = true;

            // Close the sidebar immediately before navigation
            setIsOpen(false);

            // Use setTimeout to ensure the sidebar closes before navigating
            setTimeout(() => {
                navigate("/OurStore", { state: navigationState });

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
            case "Sale":
                return (
                    <div className={styles.redirectingMessage}>
                        Redirecting to {type === "Sale" ? "Sale Items" : `${type}'s shoes`}...
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
