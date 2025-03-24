import "bootstrap/dist/css/bootstrap.min.css";
import classNames from "classnames";
import React from "react";
import styles from "./stylesShopingCart.module.scss";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCart } from "@Hooks/useProduct.js";
import CartItemsList from "./CartIttemsList.jsx";
import CartSummary from "./CartSummary.jsx";

function ShoppingCart({ cart, onDelete }) {
    // Use your existing cart hook
    const {
        cartItems,
        quantities,
        updateQuantity,
        shippingCost,
        changeShipping,
        discountCode,
        setDiscountCode,
        applyDiscount,
        total,
        isLoading,
        error,
        setError
    } = useCart(cart); // Hook to handle calculations

    {
        error && (
            <div
                className="alert alert-danger alert-dismissible fade show"
                role="alert"
            >
                {error}
                <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                ></button>
            </div>
        );
    }
    return (
        <section className={styles.shoppingCart}>
            {error && (
                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            <div
                className={classNames(
                    "container-fluid py-3",
                    styles.containerFluid
                )}
            >
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div
                            className={classNames(
                                "card",
                                styles.cardRegistration
                            )}
                        >
                            <div className="card-body p-0">
                                <div className="row g-0">
                                    {/* Left Side - Products */}
                                    <div
                                        className={classNames(
                                            "col-lg-8 col-12",
                                            styles.productSection
                                        )}
                                    >
                                        <h1>
                                            Shopping {<HiOutlineShoppingBag />}
                                        </h1>
                                        <hr />

                                        {/* Scrollable Items Container with CartItemsList component */}
                                        <div className={styles.scrollableItems}>
                                            <CartItemsList
                                                cartItems={cartItems}
                                                quantities={quantities}
                                                updateQuantity={updateQuantity}
                                                onDelete={onDelete}
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Side - Summary Component */}
                                    <CartSummary
                                        cartItems={cartItems}
                                        quantities={quantities}
                                        shippingCost={shippingCost}
                                        changeShipping={changeShipping}
                                        discountCode={discountCode}
                                        setDiscountCode={setDiscountCode}
                                        applyDiscount={applyDiscount}
                                        total={total}
                                        isLoading={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ShoppingCart;
