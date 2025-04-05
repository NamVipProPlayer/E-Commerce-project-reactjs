import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import shoesProductService from "@/apis/shoesProductService";
import cartService from "@apis/cartService.js";
import styles from "./ProductDetail.module.scss";
import { Card, CardContent } from "@component/ui/Card/Card";
import SelectSize from "@component/ui/SelectorMenu/SelecteSize.jsx";
import { ArrowLeftCircle } from "lucide-react";
import classNames from "classnames";
import wishlistService from "@apis/wishlistService.js";
import { toast } from "react-toastify";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { SideBarContext } from "@Contexts/SideBarProvider.jsx";
import { CountsContext } from "@Contexts/CountContext.jsx"; // Import CountsContext

export default function ProductDetail() {
    const { id: shoeId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [favorite, setFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { setIsOpen, setType } = useContext(SideBarContext);

    // Get count update functions from CountsContext
    const {
        incrementCartCount,
        incrementWishlistCount,
        decrementWishlistCount,
        fetchCounts
    } = useContext(CountsContext);

    // Check if user is authenticated
    const isAuthenticated = !!auth?.token;

    // Function to redirect to login sidebar
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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const productData =
                    await shoesProductService.getShoeProductById(shoeId);
                setProduct(productData);

                if (productData?.stock > 0) {
                    setQuantity(1);
                }

                if (productData?.sizes) {
                    const sizeObjects = productData.sizes.map((size) => ({
                        value: size,
                        available: true
                    }));
                    setSizes(sizeObjects);
                }

                if (productData?.colors && productData.colors.length > 0) {
                    const colorObjects = productData.colors.map((color) => ({
                        value: color,
                        available: true
                    }));
                    setColors(colorObjects);
                    setSelectedColor(colorObjects[0].value);
                }

                // If user is authenticated, check if product is in wishlist
                if (isAuthenticated) {
                    try {
                        const wishlistData =
                            await wishlistService.getWishlist();
                        const isInWishlist = wishlistData.products.some(
                            (item) => item.product._id === shoeId
                        );
                        setFavorite(isInWishlist);
                    } catch (err) {
                        console.error("Failed to fetch wishlist:", err);
                    }
                }
            } catch (err) {
                setError(err.message || "Failed to fetch product details");
            } finally {
                setLoading(false);
            }
        };

        if (shoeId) {
            fetchProduct();
        }
    }, [shoeId, isAuthenticated]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        if (!product || product.stock <= 0 || selectedSize === null) {
            // Remove toast, use console error instead
            console.error("Please select a size to continue");
            return;
        }

        if (colors.length > 0 && selectedColor === null) {
            // Remove toast, use console error instead
            console.error("Please select a color to continue");
            return;
        }

        try {
            // Calculate the final price with sale discount
            const itemPrice = product.sale
                ? parseFloat(
                      (
                          product.price -
                          (product.price * product.sale) / 100
                      ).toFixed(2)
                  )
                : product.price;

            const cartData = {
                productId: shoeId,
                size: selectedSize,
                quantity,
                color: selectedColor,
                price: itemPrice,
                originalPrice: product.price,
                sale: product.sale || 0
            };

            // First update the UI immediately (optimistic update)
            incrementCartCount();

            // Removed toast loading notification

            // Then make the API call
            await cartService.addToCart(cartData);

            // Removed toast success notification

            console.log("Added to cart successfully:", cartData);
        } catch (err) {
            console.error("Cart error:", err);
            setError("Failed to add item to cart");
            // Removed toast error notification

            // If API call fails, refresh counts to ensure accuracy
            fetchCounts();
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        try {
            if (favorite) {
                // First update UI (optimistic update)
                setFavorite(false);
                decrementWishlistCount();

                // Then make API call
                await wishlistService.removeFromWishlist(shoeId);
                toast.success("Product removed from wishlist");
            } else {
                // First update UI (optimistic update)
                setFavorite(true);
                incrementWishlistCount();

                // Then make API call
                await wishlistService.addToWishlist(shoeId);
                toast.success("Product added to wishlist");
            }
        } catch (err) {
            // If API call fails, revert the UI changes
            setFavorite(!favorite);
            if (favorite) {
                incrementWishlistCount(); // Revert the count
            } else {
                decrementWishlistCount(); // Revert the count
            }

            console.error("Failed to update wishlist:", err);
            toast.error("Failed to update wishlist");
            // Refresh counts to ensure accuracy
            fetchCounts();
        }
    };

    const updateQuantity = (change) => {
        setQuantity((prevQuantity) => {
            const newQuantity = prevQuantity + change;
            // Ensure quantity doesn't go below 1 or above stock
            if (newQuantity < 1) return 1;
            if (product && product.stock && newQuantity > product.stock)
                return product.stock;
            return newQuantity;
        });
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                Loading product details...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error</h2>
                <p>{error}</p>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.notFound}>
                <h2>Product Not Found</h2>
                <p>
                    The product you're looking for doesn't exist or has been
                    removed.
                </p>
            </div>
        );
    }

    const inStock = product.stock > 0;
    const finalPrice = product.sale
        ? (product.price - (product.price * product.sale) / 100).toFixed(2)
        : product.price.toFixed(2);

    return (
        <Container className="py-5 mt-5 overflow-hiden">
            <Row className={styles.equalHeightRow}>
                <Col md={6} className={styles.imageColumn}>
                    <div className={styles.imageWrapper}>
                        {product.bestSeller && (
                            <Badge
                                bg="warning"
                                text="danger"
                                pill={2}
                                className={styles.bestSellerBadge}
                            >
                                Best Seller
                            </Badge>
                        )}
                        <img
                            src={product.fSrc}
                            alt={`${product.name} front`}
                            className={styles.productImage}
                        />
                        <img
                            src={product.sSrc}
                            alt={`${product.name} side`}
                            className={styles.productImageSecondary}
                        />
                    </div>
                </Col>
                <Col md={6} className={styles.cardColumn}>
                    <Card className={styles.productCard}>
                        <CardContent className={styles.cardContent}>
                            <h1 className="mb-3">{product.name}</h1>

                            <div className="d-flex align-items-center mb-2">
                                <Badge bg="secondary" className="me-2">
                                    {product.brand}
                                </Badge>
                                <Badge bg="secondary" text="light">
                                    {product.category}
                                </Badge>
                            </div>

                            <div className="mb-4">
                                {product.sale ? (
                                    <div className="d-flex align-items-center">
                                        <h3 className="text-primary mb-0">
                                            ${finalPrice}
                                        </h3>
                                        <span className="ms-2 text-secondary text-decoration-line-through">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <Badge bg="danger" className="ms-2">
                                            {product.sale}% OFF
                                        </Badge>
                                    </div>
                                ) : (
                                    <h3 className="text-primary">
                                        ${finalPrice}
                                    </h3>
                                )}
                            </div>

                            <div className="mb-4">
                                <h5>Description:</h5>
                                <ul>
                                    <li>{product.description}</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <SelectSize
                                    sizes={sizes}
                                    selectedSize={selectedSize}
                                    onSizeSelect={(size) =>
                                        setSelectedSize(size.value)
                                    }
                                />
                            </div>

                            {colors.length > 0 && (
                                <div className="mb-4">
                                    <h5>Color:</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {colors.map((color) => (
                                            <div
                                                key={color.value}
                                                className={classNames(
                                                    styles.colorOption,
                                                    {
                                                        [styles.selectedColor]:
                                                            selectedColor ===
                                                            color.value
                                                    }
                                                )}
                                                style={{
                                                    backgroundColor: color.value
                                                }}
                                                onClick={() =>
                                                    setSelectedColor(
                                                        color.value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex align-items-center flex-wrap mb-4">
                                <div className="me-3 mb-2">
                                    <label
                                        htmlFor="quantity"
                                        className="form-label"
                                    >
                                        Quantity:
                                    </label>
                                </div>
                                {/* Quantity Controls */}
                                <div className={styles.quantityControls}>
                                    <button
                                        className={classNames(
                                            "btn btn-outline-secondary btn-sm",
                                            styles.smallButton
                                        )}
                                        onClick={() => updateQuantity(-1)}
                                        disabled={!inStock || quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        id="quantity"
                                        min="1"
                                        max={product.stock || 1}
                                        value={quantity}
                                        type="number"
                                        className={classNames(
                                            "form-control form-control-sm",
                                            styles.quantityInput
                                        )}
                                        readOnly
                                    />
                                    <button
                                        className={classNames(
                                            "btn btn-outline-secondary btn-sm",
                                            styles.smallButton
                                        )}
                                        onClick={() => updateQuantity(1)}
                                        disabled={
                                            !inStock ||
                                            (product.stock &&
                                                quantity >= product.stock)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="ms-3">
                                {inStock ? (
                                    <Badge bg="success">
                                        In Stock ({product.stock})
                                    </Badge>
                                ) : (
                                    <Badge bg="danger">Out of Stock</Badge>
                                )}
                            </div>
                            <div className="d-flex gap-3 mt-4 flex-column justify-center align-items-center">
                                <Button
                                    variant="outline-dark"
                                    size="small"
                                    onClick={handleAddToCart}
                                    disabled={
                                        !inStock ||
                                        selectedSize === null ||
                                        (colors.length > 0 &&
                                            selectedColor === null)
                                    }
                                    className="px-5 w-100 rounded-pill"
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant={
                                        favorite ? "warning" : "outline-warning"
                                    }
                                    size="small"
                                    onClick={handleFavorite}
                                    className="px-5 w-100 rounded-pill"
                                >
                                    {favorite ? "Favorited" : "Favorite"}
                                </Button>
                            </div>
                            <div
                                className={classNames(
                                    "mt-auto d-flex gap-2 align-items-center ",
                                    styles.backToPageContainer
                                )}
                                onClick={() => {
                                    navigate("/OurStore");
                                }}
                            >
                                <ArrowLeftCircle />{" "}
                                <span className={styles.backToPage}>
                                    Back to Our Store
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
