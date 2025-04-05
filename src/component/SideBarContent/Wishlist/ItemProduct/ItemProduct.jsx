import { useContext, useEffect, useState } from "react";
import styles from "./stylesItemProduct.module.scss";
import { IoClose } from "react-icons/io5";
import cartService from "@apis/cartService.js";
import { toast } from "react-toastify";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { CountsContext } from "@Contexts/CountContext.jsx"; // Import CountsContext
import ProductCard from "../ProductCard/ProductCard.jsx";
import { Modal } from "react-bootstrap";

function ItemProduct({ product, onDelete }) {
    const {
        tagClose,
        container,
        imgContainer,
        content,
        productType,
        productName,
        productPrice,
        productButton,
        modalContent
    } = styles;

    const [isLoading, setIsLoading] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);

    // Access auth context to check user login status
    const { auth } = useContext(AuthContext);
    // Access sidebar context to open sidebar with login if necessary
    const { setIsOpen, setType } = useContext(SideBarContext);
    // Access counts context for cart count updates
    const { incrementCartCount, fetchCounts } = useContext(CountsContext);
   
    // Check if user is authenticated
    const isAuthenticated = !!auth?.token;

    // Function to redirect to login sidebar
    const redirectToLogin = () => {
        toast.info("You haven't logged in yet!", {
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

    // Function to add product to cart with selected size
    const addProductToCart = async (size) => {
        // Check if user is logged in
        if (!isAuthenticated) {
            redirectToLogin();
            return false;
        }
        
        try {
            setIsLoading(true);

            const cartData = {
                productId: product._id,
                size: size,
                quantity: 1
            };

            // First update the UI immediately for responsive feedback
            incrementCartCount();
            
            // Then make the API call
            await cartService.addToCart(cartData);
            
            // Show success message
            toast.success("Added to cart successfully!", {
                position: "top-right",
                autoClose: 2000
            });

            // Hide the modal after successful addition
            setShowProductModal(false);
            return true;
        } catch (error) {
            console.error("Error adding product to cart:", error);
            
            // If the API call fails, revert the count increment
            fetchCounts(); // Refresh counts to ensure accuracy
            
            toast.error("Failed to add product to cart", {
                position: "top-right",
                autoClose: 2000
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for opening the product modal
    const handleOpenProductModal = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setShowProductModal(true);
    };

    // Handler for closing the product modal
    const handleCloseProductModal = () => {
        setShowProductModal(false);
    };

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

    return (
        <div className={container}>
            <div>
                <img
                    className={imgContainer}
                    src={product.fSrc}
                    alt={product.name}
                />
            </div>
            <div className={content}>
                <div className={productType}>{product.category}</div>
                <div className={productName}>{product.name}</div>
                <div className={productPrice}>${product.price}</div>
            </div>
            <div className={productButton}>
                <button onClick={handleOpenProductModal} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add to Cart"}
                </button>
            </div>

            <IoClose
                className={tagClose}
                size={"1.2rem"}
                onClick={() => onDelete(product._id)}
            />

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
                        product={product}
                        addToCart={addProductToCart}
                        isLoading={isLoading}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ItemProduct;
