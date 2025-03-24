import React from "react";
import classNames from "classnames";
import styles from "./stylesShopingCart.module.scss";
import { useNavigate } from "react-router-dom";

function CartSummary({
    cartItems,
    quantities,
    shippingCost,
    changeShipping,
    discountCode,
    setDiscountCode,
    applyDiscount,
    total
}) {
    const navigate = useNavigate();
    
    const subtotal = cartItems
        .reduce(
            (sum, item) =>
                sum + (quantities[item.product._id] || 0) * item.product.price,
            0
        )
        .toFixed(2);

    const isEmptyCart = !cartItems || cartItems.length === 0;

    // Handle checkout with data passing
    const handleCheckout = () => {
        // Create a data object with all the cart information
        const checkoutData = {
            cartItems: cartItems,
            quantities: quantities,
            shippingCost: shippingCost,
            discountCode: discountCode,
            subtotal: parseFloat(subtotal),
            total: total,
            // Format cart items for OrderSummary component
            orderData: {
                subtotal: parseFloat(subtotal),
                items: cartItems.map((item) => ({
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: quantities[item.product._id] || 0,
                    size: item.size || "Standard",
                    fSrc: item.product.fSrc,

                })),
                deliveryDate: {
                    start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                    end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
                }
            }
        };

        // Navigate to checkout page with the data
        navigate("/CheckOut", { state: { checkoutData } });
    };

    return (
        <div className={classNames("col-lg-4 col-12", styles.summarySection)}>
            <h3>Summary</h3>
            <hr />

            <div className={styles.summaryTotal}>
                <h6 className="text-uppercase">Subtotal</h6>
                <h6>${subtotal}</h6>
            </div>

            {/* Shipping */}
            <h6 className="text-uppercase mb-2">Shipping</h6>
            <select
                className="form-select mb-3"
                onChange={(e) => changeShipping(e.target.value)}
            >
                <option value="standard">Standard - $5.00</option>
                <option value="fast">Fast - $12.00</option>
                <option value="airplane">Airplane - $20.00</option>
            </select>

            <div className={styles.summaryTotal}>
                <h6>Shipping Cost</h6>
                <h6>${shippingCost.toFixed(2)}</h6>
            </div>

            {/* Discount Code */}
            <h6 className="text-uppercase mb-2">Discount Code</h6>
            <div className="d-flex">
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Enter your code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                    className="btn btn-dark"
                    onClick={() => applyDiscount(discountCode)}
                >
                    Apply
                </button>
            </div>

            <hr />

            <div className={styles.summaryTotal}>
                <h5>Total Price</h5>
                <h5>${total.toFixed(2)}</h5>
            </div>

            <button
                className="btn btn-dark w-100"
                disabled={isEmptyCart}
                onClick={handleCheckout}
            >
                Check out
            </button>
        </div>
    );
}

export default CartSummary;
