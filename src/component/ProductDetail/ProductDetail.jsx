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

export default function ProductDetail() {
    const { id: shoeId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [favorite, setFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sizes, setSizes] = useState([]);
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { setIsOpen, setType } = useContext(SideBarContext);

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
        if (!product || product.stock <= 0 || selectedSize === null) return;
        try {
            const cartData = {
                productId: shoeId,
                size: selectedSize,
                quantity
            };
            await cartService.addToCart(cartData);
            toast.success("Product added to cart!");
            console.log("Adding to cart:", cartData);
        } catch (err) {
            setError("Failed to add item to cart");
            toast.error("Failed to add item to cart");
        }
    };
    const handleFavorite = async () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        try {
            if (favorite) {
                // If already in wishlist, remove it
                await wishlistService.removeFromWishlist(shoeId);
                setFavorite(false);
                toast.success("Product removed from wishlist");
            } else {
                // If not in wishlist, add it
                await wishlistService.addToWishlist(shoeId);
                setFavorite(true);
                toast.success("Product added to wishlist");
            }
        } catch (err) {
            console.error("Failed to update wishlist:", err);
            toast.error("Failed to update wishlist");
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

    return (
        <Container className="py-5 mt-5 overflow-hiden">
            <Row className={styles.equalHeightRow}>
                <Col md={6} className={styles.imageColumn}>
                    <div className={styles.imageWrapper}>
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
                            <h3 className="text-primary mb-4">
                                ${product.price.toFixed(2)}
                            </h3>
                            <div className="mb-4">
                                <h5>Description:</h5>
                                <ul>
                                    <li>{product.description}</li>
                                </ul>
                            </div>

                            <SelectSize
                                sizes={sizes}
                                selectedSize={selectedSize}
                                onSizeSelect={(size) =>
                                    setSelectedSize(size.value)
                                }
                            />

                            <div className="d-flex align-items-center mb-4">
                                <div className="me-3">
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
                                <div className="ms-3">
                                    {inStock ? (
                                        <Badge bg="success">
                                            In Stock ({product.stock})
                                        </Badge>
                                    ) : (
                                        <Badge bg="danger">Out of Stock</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-3 mt-4 flex-column justify-center align-items-center">
                                <Button
                                    variant="outline-dark"
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={!inStock || selectedSize === null}
                                    className="px-5 w-100 rounded-pill"
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant={
                                        favorite ? "warning" : "outline-warning"
                                    }
                                    size="lg"
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
