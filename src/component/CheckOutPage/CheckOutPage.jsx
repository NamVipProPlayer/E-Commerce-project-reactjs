import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import orderService from "@apis/orderService.js";
import OrderSummary from "@component/CheckOutPage/OrderSummary/OrderSummary";
import DeliveryAddress from "@component/CheckOutPage/DeliveryAddress/DeliveryAddress.jsx";
import PaymentSection from "@component/CheckOutPage/Payment/PaymentSection";
import styles from "./CheckOut.module.scss";
import useShippingQualification from "@Hooks/useShippingQualification.js";

const CheckoutPage = () => {
    const location = useLocation();

    const { checkoutData } = location.state || {
        checkoutData: {
            orderData: {
                subtotal: 0,
                items: [],
                deliveryDate: {
                    start: new Date(),
                    end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                }
            },
            shippingCost: 0,
            discountCode: "",
            total: 0
        }
    };

    const [addressData, setAddressData] = useState(null);

    // Calculate the adjusted total here at the top level
    const subtotal = checkoutData.orderData.subtotal || 0;
    const shippingCost = checkoutData.shippingCost || 0;
    const total = checkoutData.total || 0;

    // Free shipping threshold logic
    const { qualifiesForFreeShipping, adjustedTotal, shippingDisplay } =
           useShippingQualification(subtotal, shippingCost, total);


    const handleAddressSubmit = (data) => {
        setAddressData(data);
    };

    const handleOrderSubmit = (paymentDetails) => {
        // Use the adjusted total in the final order data
        const finalOrderData = {
            orderItems: checkoutData.cartItems,
            quantities: checkoutData.quantities,
            shippingAddress: addressData,
            shippingCost: qualifiesForFreeShipping
                ? 0
                : checkoutData.shippingCost, // Apply free shipping if qualified
            discountCode: checkoutData.discountCode,
            subtotal: checkoutData.subtotal,
            total: adjustedTotal, // Always use the adjusted total here
            applyFreeShipping: qualifiesForFreeShipping, // Add this flag for clarity
            paymentDetails: paymentDetails
        };

        // Log the final order data for verification
        console.log("Sending order to backend:", finalOrderData);

        // Send to backend
        // orderService.createOrder(finalOrderData)
        //    .then(response => {
        //        // Handle success
        //    })
        //    .catch(error => {
        //        // Handle error
        //    });
    };

    return (
        <div className={styles.checkoutPage}>
            {/* Left Column - Forms */}
            <div className={styles.formColumn}>
                {/* Delivery Address Section */}
                <DeliveryAddress onAddressSubmit={handleAddressSubmit} />

                {/* Payment Section - pass the adjusted total */}
                <PaymentSection
                    shippingAddress={addressData}
                    onPaymentSubmit={handleOrderSubmit}
                    subtotal={subtotal}
                    total={total} // Raw total without shipping
                    items={checkoutData.orderData.items}
                    discountCode={checkoutData.discountCode}
                    shippingCost={shippingCost}
                    qualifiesForFreeShipping={qualifiesForFreeShipping}
                    adjustedTotal={adjustedTotal} // Pass the adjusted total
                />
            </div>

            {/* Right Column - Order Summary */}
            <div className={styles.summaryColumn}>
                <OrderSummary
                    shippingCost={shippingCost}
                    total={total} // Raw total without shipping
                    subtotal={subtotal}
                    items={checkoutData.orderData.items}
                    deliveryDate={checkoutData.orderData.deliveryDate}
                    qualifiesForFreeShipping={qualifiesForFreeShipping} // Pass this flag directly
                    adjustedTotal={adjustedTotal} // Pass the adjusted total
                />
            </div>
        </div>
    );
};

export default CheckoutPage;
