import styles from "./stylesProductItems.module.scss";
import bestsell from "@Images/bestSeller.png";
import bestsellZoom from "@Images/bestSellZoom.jpg";
import eyeIcon from "@Icons/svgs/eyeIcon.svg";
import heartIcon from "@Icons/svgs/heart.svg";
import bagIcon from "@Icons/svgs/handbag.svg";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { toast } from "react-toastify";
import { SideBarContext } from "@Contexts/SideBarProvider";
import wishlistService from "@apis/wishlistService.js";
import cartService from "@apis/cartService.js";
import { CountsContext } from "@Contexts/CountContext.jsx";
import { Modal } from "react-bootstrap";
import ProductCard from "../SideBarContent/Wishlist/ProductCard/ProductCard.jsx";
import { useNavigate, useNavigation } from "react-router-dom";

function ProductItems({ itemId, src, prevSrc, name, price, product }) {
    const {
        imgItems,
        showHover,
        showSidebarItemHover,
        containerIcon,
        itemPrice,
        itemName,
        modalContent // Add this if you have modal styling in your CSS
    } = styles;

    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    const { auth } = useContext(AuthContext);
    const isAuthenticated = !!auth?.token;
    const { setIsOpen, setType } = useContext(SideBarContext);
    const {
        incrementWishlistCount,
        decrementWishlistCount,
        incrementCartCount,
        fetchCounts
    } = useContext(CountsContext);
    const navigate = useNavigate();
    function handleClickSee()
    {
        navigate(`/product/${itemId}`);
    }

    // Modal handlers
    const handleOpenProductModal = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

    // Apply styling to modal backdrop when shown
    useEffect(() => {
        if (showProductModal) {
            // Apply backdrop blur when modal is shown
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
                modalBackdrop.style.backdropFilter = "blur(8px)";
                modalBackdrop.style.webkitBackdropFilter = "blur(8px)";
                modalBackdrop.style.opacity = "0.5";
                modalBackdrop.style.zIndex = "6000";
            }

            // Set the modal content z-index
            const modalContent = document.querySelector(".modal");
            if (modalContent) {
                modalContent.style.zIndex = "10000";
            }
        }
    }, [showProductModal]);

    // Function for wishlist item checking
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!isAuthenticated || !itemId) return;

            try {
                const wishlist = await wishlistService.getWishlist();
                console.log("wishlist data:", wishlist);
                const isInWishlist = Array.isArray(wishlist)
                    ? wishlist.some((item) => item._id === itemId)
                    : (wishlist.products || []).some(
                          (item) => item._id === itemId
                      );

                setIsFavorite(isInWishlist);
            } catch (error) {
                console.error("Error checking wishlist status:", error);
            }
        };

        checkWishlistStatus();
    }, [itemId, isAuthenticated]);

    const redirectToLogin = () => {
        toast("You haven't Login yet!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
        setType("Sign In");
        setIsOpen(true);
    };

    const handleAddFavorite = async () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        try {
            if (!isFavorite) {
                setIsFavorite(true);
                incrementWishlistCount();
                await wishlistService.addToWishlist(itemId);
                console.log("Added to wishlist:", itemId);
            } else {
                setIsFavorite(false);
                decrementWishlistCount();
                await wishlistService.removeFromWishlist(itemId);
                console.log("removed from wishlist:", itemId);
            }
        } catch (error) {
            setIsFavorite(!isFavorite);
            if (!isFavorite) {
                decrementWishlistCount();
            } else {
                incrementWishlistCount();
            }

            console.error("Error toggling wishlist item:", error);
            toast.error("An error occurred");
            fetchCounts();
        }
    };

    // Function to add product to cart with selected size
    const addProductToCart = async (size) => {
        try {
            setIsLoading(true);

            const cartData = {
                productId: itemId,
                size: size,
                quantity: 1
            };

            await cartService.addToCart(cartData);

            // Update cart count
            incrementCartCount();

            // Show success message
            toast.success("Added to cart successfully!", {
                position: "top-right",
                autoClose: 2000
            });

            // Close modal
            setShowProductModal(false);
            return true;
        } catch (error) {
            console.error("Error adding product to cart:", error);
            toast.error("Failed to add product to cart", {
                position: "top-right",
                autoClose: 2000
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Create a product object from props if not provided
    const productData = product || {
        _id: itemId,
        name: name,
        price: price,
        fSrc: src,
        category: "Product", // Default category if not available
        sizes: ["S", "M", "L", "XL"] // Default sizes if not available
    };

    return (
        <div>
            <div className={imgItems}>
                <img src={src} alt="Best Seller" />
                <img
                    src={prevSrc}
                    alt="Best Seller Zoom"
                    className={showHover}
                />

                <div className={showSidebarItemHover}>
                    <div className={containerIcon} onClick={handleAddFavorite}>
                        <img src={heartIcon} alt="Add to Wishlist" />
                    </div>
                    <div
                        className={containerIcon}
                        onClick={handleOpenProductModal}
                    >
                        <img src={bagIcon} alt="Add to Cart" />
                    </div>
                    <div className={containerIcon} onClick={ ()=>handleClickSee()}>
                        <img src={eyeIcon} alt="View Details" />
                    </div>
                </div>
            </div>
            <div className={itemName}>{name}</div>
            <div className={itemPrice}>{price}$</div>

            {/* Product Modal */}
            <Modal
                show={showProductModal}
                onHide={handleCloseProductModal}
                centered
                size="lg"
                aria-labelledby="product-modal"
                className={modalContent}
                container={document.body}
                style={{ zIndex: 10000 }}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="product-modal">Select Size</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ProductCard
                        product={productData}
                        addToCart={addProductToCart}
                        isLoading={isLoading}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ProductItems;
