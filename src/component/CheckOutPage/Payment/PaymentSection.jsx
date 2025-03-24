import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CreditCard,
    AlertCircle,
    CheckCircle,
    ShieldCheck
} from "lucide-react";
import { TbTruckDelivery } from "react-icons/tb";
import VNPAY from "@Icons/svgs/VNPAY/VNPAY_id-sVSMjm2_1.svg";
import paymentService from "@apis/paymentService.js";
import orderService from "@apis/orderService.js"; // Import orderService
import styles from "./PaymentSection.module.scss";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";

const PaymentSection = ({
    onPaymentSubmit,
    subtotal,
    total,
    items,
    discountCode,
    shippingAddress,
    userData,
    shippingCost,
    qualifiesForFreeShipping = false,
    adjustedTotal
}) => {
    // State management
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const [promoCode, setPromoCode] = useState(discountCode || "");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(null);
    const [errors, setErrors] = useState({});

    // Current date and time
    const currentDateTime = "2025-03-17 10:57:11";
    const currentUser = "NamProPlayer20";

    // Get context with safe fallback
    const contextValue = useContext(StorageContext) || {};
    const userInfo = contextValue.userInfo || {};

    // Navigation
    const navigate = useNavigate();

    // Card details state
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        expiry: "",
        cvc: "",
        name: ""
    });

    // Format card number with spaces
    const formatCardNumber = (value) => {
        if (!value) return "";
        const digits = value.replace(/\D/g, "").substring(0, 16);
        const groups = [];

        for (let i = 0; i < digits.length; i += 4) {
            groups.push(digits.substring(i, i + 4));
        }

        return groups.join(" ");
    };

    // Format expiry date as MM/YY
    const formatExpiry = (value) => {
        if (!value) return "";
        const digits = value.replace(/\D/g, "").substring(0, 4);

        if (digits.length > 2) {
            return `${digits.substring(0, 2)}/${digits.substring(2)}`;
        }
        return digits;
    };

    // Format CVC to be numbers only
    const formatCVC = (value) => {
        return value.replace(/\D/g, "").substring(0, 4);
    };

    // Handle input changes with field-specific formatting
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let formattedValue = value;

        // Apply specific formatting based on field type
        if (id === "cardNumber") {
            formattedValue = formatCardNumber(value);
        } else if (id === "expiry") {
            formattedValue = formatExpiry(value);
        } else if (id === "cvc") {
            formattedValue = formatCVC(value);
        }

        setCardDetails((prev) => ({
            ...prev,
            [id]: formattedValue
        }));

        // Clear error when user types
        if (errors[id]) {
            setErrors((prev) => ({
                ...prev,
                [id]: null
            }));
        }
    };

    // Map payment method names to enum values in order schema
    const getPaymentMethodForDB = (method) => {
        switch (method) {
            case "credit":
                return "Credit Card";
            case "gpay":
                return "VNPay";
            case "Cash on delivery":
                return "Cash on Delivery";
            default:
                return "Credit Card";
        }
    };

    // Validate card details before submission
    const validateCardDetails = () => {
        const newErrors = {};

        if (paymentMethod === "credit") {
            // Card number validation
            const cardNumberStripped = cardDetails.cardNumber.replace(
                /\s/g,
                ""
            );
            if (
                !cardNumberStripped ||
                cardNumberStripped.length < 13 ||
                cardNumberStripped.length > 16
            ) {
                newErrors.cardNumber = "Please enter a valid card number";
            }

            // Expiry date validation
            if (!cardDetails.expiry || !cardDetails.expiry.includes("/")) {
                newErrors.expiry = "Please enter a valid expiry date (MM/YY)";
            } else {
                const [month, year] = cardDetails.expiry.split("/");

                if (
                    !month ||
                    !year ||
                    parseInt(month) < 1 ||
                    parseInt(month) > 12
                ) {
                    newErrors.expiry = "Invalid month in expiry date";
                } else {
                    // Check if card is expired
                    const now = new Date();
                    const cardYear = 2000 + parseInt(year);
                    const cardMonth = parseInt(month) - 1;
                    const expiryDate = new Date(cardYear, cardMonth, 1);

                    if (expiryDate < now) {
                        newErrors.expiry = "This card has expired";
                    }
                }
            }

            // CVC validation
            if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
                newErrors.cvc =
                    "Please enter a valid security code (3-4 digits)";
            }

            // Name validation
            if (!cardDetails.name || cardDetails.name.trim().length < 3) {
                newErrors.name =
                    "Please enter the name as it appears on your card";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        // Validate form if using credit card
        if (paymentMethod === "credit" && !validateCardDetails()) {
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);
        setPaymentSuccess(null);

        try {
            // Create order object with all required fields
            const orderData = {
                user: userInfo?._id || "guest-user",
                items: items.map((item) => ({
                    product: item.id,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: subtotal,
                shipping: qualifiesForFreeShipping ? 0 : shippingCost,
                couponCode: promoCode || null,
                discount: subtotal - total,
                finalAmount: adjustedTotal, // Use the adjusted total
                paymentStatus: "Pending",
                orderStatus: "Processing",
                statusHistory: [
                    {
                        status: "Processing",
                        timestamp: currentDateTime,
                        note: "Order placed"
                    }
                ],
                shippingAddress: {
                    ...(shippingAddress || {}),
                    houseNumber: shippingAddress?.houseNumber || "",
                    street: shippingAddress?.street || "",
                    ward: shippingAddress?.ward || "",
                    district: shippingAddress?.district || "",
                    cityOrProvince: shippingAddress?.cityOrProvince || "",
                    phoneNumber: shippingAddress?.phoneNumber || ""
                },
                paymentMethod: getPaymentMethodForDB(paymentMethod),
                customerNotes: "",
                orderedAt: currentDateTime,
                updatedAt: currentDateTime,
                freeShippingApplied: qualifiesForFreeShipping
            };

            // Handle each payment method differently
            if (paymentMethod === "credit") {
                setPaymentSuccess("Processing your credit card payment...");

                try {
                    // Call the API to create the order
                    const createdOrder = await orderService.createOrder(
                        orderData
                    );

                    // Submit payment details to parent component
                    onPaymentSubmit({
                        method: "Credit Card",
                        cardDetails: {
                            ...cardDetails,
                            cardNumber: cardDetails.cardNumber.replace(
                                /\s/g,
                                ""
                            )
                        },
                        orderData: createdOrder
                    });

                    // Navigate to success page after successful order creation
                    navigate("/account/orders", {
                        state: {
                            paymentMethod: "Credit Card",
                            amount: adjustedTotal,
                            orderId: createdOrder._id,
                            success: true,
                            timestamp: currentDateTime
                        }
                    });
                } catch (error) {
                    console.error("Failed to create order:", error);
                    setPaymentError(
                        `Failed to process order: ${
                            error.message || "Unknown error"
                        }`
                    );
                    setIsProcessing(false);
                }
            } else if (paymentMethod === "Cash on delivery") {
                setPaymentSuccess("Processing your Cash on Delivery order...");

                try {
                    // Call the API to create the order
                    const createdOrder = await orderService.createOrder(
                        orderData
                    );

                    // Submit payment details to parent component
                    onPaymentSubmit({
                        method: "Cash on Delivery",
                        status: "pending",
                        orderData: createdOrder
                    });

                    // Navigate to success page
                    navigate("/account/orders", {
                        state: {
                            paymentMethod: "Cash on Delivery",
                            orderId: createdOrder._id,
                            amount: adjustedTotal,
                            success: true,
                            timestamp: currentDateTime
                        }
                    });
                } catch (error) {
                    console.error("Failed to create order:", error);
                    setPaymentError(
                        `Failed to process order: ${
                            error.message || "Unknown error"
                        }`
                    );
                    setIsProcessing(false);
                }
            } else if (paymentMethod === "gpay") {
                // VNPAY integration
                setPaymentSuccess("Preparing secure VNPAY checkout...");

                // Generate unique order ID
                const now = new Date();
                const orderId = `${now.getTime().toString().slice(-6)}`;

                // Store order data for retrieval after redirect
                localStorage.setItem(
                    "pendingOrder",
                    JSON.stringify({
                        ...orderData,
                        orderId,
                        timestamp: currentDateTime
                    })
                );

                // Get user's IP for VNPAY
                const ipAddr = await fetch("https://api.ipify.org?format=json")
                    .then((res) => res.json())
                    .then((data) => data.ip)
                    .catch(() => "127.0.0.1");

                // Convert to VND (Vietnamese Dong)
                const conversionRate = 23000;
                const amountInVND = Math.round(adjustedTotal * conversionRate);

                // Create VNPAY payment URL
                const result = await paymentService.createVNPayUrl({
                    amount: amountInVND,
                    bankCode: "", // Show all banks
                    language: "vn",
                    orderId: orderId,
                    orderInfo: `Payment for order #${orderId} - User: ${currentUser}`,
                    orderType: "fashion",
                    ipAddr: ipAddr,
                    createDate: currentDateTime
                        .replace(/[-: ]/g, "")
                        .substring(0, 14)
                });

                // Redirect to VNPAY payment page
                if (result && result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    throw new Error("Failed to get payment URL from VNPAY");
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentError(
                `Failed to process payment: ${error.message || "Unknown error"}`
            );
            setPaymentSuccess(null);
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.paymentContainer}>
            <h2 className={styles.title}>Payment</h2>

            {paymentError && (
                <div className={styles.errorMessage}>
                    <AlertCircle className={styles.errorIcon} />
                    {paymentError}
                </div>
            )}

            {paymentSuccess && (
                <div className={styles.successMessage}>
                    <CheckCircle className={styles.successIcon} />
                    {paymentSuccess}
                </div>
            )}

            {/* Promo Code Section */}
            <div className={styles.promoSection}>
                <h3 className={styles.sectionTitle}>Promo Code Applied</h3>
                <input
                    type="text"
                    placeholder="None"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={styles.input}
                    readOnly
                />
            </div>

            {/* Payment Summary */}
            <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                {discountCode && (
                    <div className={styles.discountRow}>
                        <span>Discount ({discountCode}):</span>
                        <span>-${(subtotal - total).toFixed(2)}</span>
                    </div>
                )}

                {/* Shipping cost row */}
                <div className={styles.summaryRow}>
                    <span>Shipping:</span>
                    <span
                        className={
                            qualifiesForFreeShipping ? styles.freeShipping : ""
                        }
                    >
                        {qualifiesForFreeShipping
                            ? "FREE"
                            : `$${shippingCost.toFixed(2)}`}
                    </span>
                </div>

                {qualifiesForFreeShipping && (
                    <div className={styles.freeShippingNote}>
                        <span>
                            You qualify for free shipping on orders over $500!
                        </span>
                    </div>
                )}

                <div className={styles.totalRow}>
                    <span>Total:</span>
                    <span>${adjustedTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className={styles.methodSection}>
                <h3 className={styles.sectionTitle}>
                    How would you like to pay?
                </h3>

                <div className={styles.options}>
                    <button
                        className={`${styles.option} ${
                            paymentMethod === "credit" ? styles.selected : ""
                        }`}
                        onClick={() => setPaymentMethod("credit")}
                        disabled={isProcessing}
                        type="button"
                    >
                        <CreditCard className={styles.icon} />
                        <span className={styles.text}>
                            Credit or Debit Card
                        </span>
                    </button>

                    <button
                        className={`${styles.option} ${
                            paymentMethod === "Cash on delivery"
                                ? styles.selected
                                : ""
                        }`}
                        onClick={() => setPaymentMethod("Cash on delivery")}
                        disabled={isProcessing}
                        type="button"
                    >
                        <TbTruckDelivery
                            size={"1.5rem"}
                            className={styles.icon}
                        />
                        <span className={styles.text}>Cash on Delivery</span>
                    </button>

                    <button
                        className={`${styles.option} ${
                            paymentMethod === "gpay" ? styles.selected : ""
                        }`}
                        onClick={() => setPaymentMethod("gpay")}
                        disabled={isProcessing}
                        type="button"
                    >
                        <img src={VNPAY} alt="VNPAY" className={styles.logo} />
                        <span className={styles.text}>VNPAY</span>
                    </button>
                </div>
            </div>

            {/* Payment Details Section */}
            <div className={styles.detailsSection}>
                {paymentMethod === "credit" && (
                    <div className={styles.creditCardForm}>
                        <h3 className={styles.sectionTitle}>
                            Enter your payment details:
                        </h3>

                        <div
                            className={`${styles.field} ${
                                errors.cardNumber ? styles.fieldError : ""
                            }`}
                        >
                            <label
                                htmlFor="cardNumber"
                                className={styles.label}
                            >
                                Card Number
                            </label>
                            <input
                                type="text"
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                className={styles.input}
                                value={cardDetails.cardNumber}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                maxLength={19}
                                inputMode="numeric"
                                autoComplete="cc-number"
                            />
                            {errors.cardNumber && (
                                <div className={styles.errorText}>
                                    {errors.cardNumber}
                                </div>
                            )}
                        </div>

                        <div className={styles.row}>
                            <div
                                className={`${styles.field} ${
                                    styles.halfField
                                } ${errors.expiry ? styles.fieldError : ""}`}
                            >
                                <label
                                    htmlFor="expiry"
                                    className={styles.label}
                                >
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    id="expiry"
                                    placeholder="MM/YY"
                                    className={styles.input}
                                    value={cardDetails.expiry}
                                    onChange={handleInputChange}
                                    disabled={isProcessing}
                                    maxLength={5}
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                />
                                {errors.expiry && (
                                    <div className={styles.errorText}>
                                        {errors.expiry}
                                    </div>
                                )}
                            </div>
                            <div
                                className={`${styles.field} ${
                                    styles.halfField
                                } ${errors.cvc ? styles.fieldError : ""}`}
                            >
                                <label htmlFor="cvc" className={styles.label}>
                                    CVC
                                </label>
                                <input
                                    type="text"
                                    id="cvc"
                                    placeholder="123"
                                    className={styles.input}
                                    value={cardDetails.cvc}
                                    onChange={handleInputChange}
                                    disabled={isProcessing}
                                    maxLength={4}
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                />
                                {errors.cvc && (
                                    <div className={styles.errorText}>
                                        {errors.cvc}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            className={`${styles.field} ${
                                errors.name ? styles.fieldError : ""
                            }`}
                        >
                            <label htmlFor="name" className={styles.label}>
                                Name on Card
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="John Doe"
                                className={styles.input}
                                value={cardDetails.name}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                autoComplete="cc-name"
                            />
                            {errors.name && (
                                <div className={styles.errorText}>
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div className={styles.securityNote}>
                            <ShieldCheck
                                size={14}
                                className={styles.securityIcon}
                            />
                            <span>
                                Your payment information is secure and encrypted
                            </span>
                        </div>
                    </div>
                )}

                {paymentMethod === "gpay" && (
                    <div className={styles.message}>
                        <p>
                            You'll be redirected to VNPAY to complete your
                            payment securely.
                        </p>
                        <div className={styles.secureInfo}>
                            <ShieldCheck className={styles.securityIcon} />
                            <small>
                                VNPAY is a secure payment gateway widely used in
                                Vietnam. Your payment information is protected
                                with industry-standard encryption.
                            </small>
                        </div>
                    </div>
                )}

                {paymentMethod === "Cash on delivery" && (
                    <div className={styles.message}>
                        <p>You'll pay when your order is delivered.</p>
                        <div className={styles.noticeInfo}>
                            <small>
                                Please ensure someone is available to receive
                                the package and make the payment. Our delivery
                                personnel will contact you before arrival.
                            </small>
                        </div>
                    </div>
                )}
            </div>

            <button
                className={`${styles.completePurchaseButton} ${
                    isProcessing ? styles.processing : ""
                }`}
                onClick={handleSubmit}
                disabled={isProcessing}
                type="button"
            >
                {isProcessing ? (
                    <span className={styles.loadingState}>
                        <span className={styles.spinner}></span>
                        Processing...
                    </span>
                ) : (
                    <>Complete Purchase • ${adjustedTotal.toFixed(2)}</>
                )}
            </button>

            <div className={styles.termsNote}>
                By completing your purchase, you agree to our
                <a href="/terms" className={styles.termsLink}>
                    {" "}
                    Terms of Service
                </a>{" "}
                and
                <a href="/privacy" className={styles.termsLink}>
                    {" "}
                    Privacy Policy
                </a>
            </div>
        </div>
    );
};

export default PaymentSection;
