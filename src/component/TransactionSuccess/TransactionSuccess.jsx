import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Printer, ArrowLeft, ShoppingBag } from "lucide-react";
import styles from "./TransectionSuccess.module.scss";
import orderService from "@apis/orderService.js";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import cartService from "@apis/cartService.js";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";

const TransactionSuccess = () => {
    const { userInfo } = useContext(StorageContext);
    // Current user and date information
    const currentUser = userInfo?.name || "NamProPlayer20";
   const [currentDateTime, setCurrentDateTime] = useState(
           getCurrentFormattedDateTime()
       );

    const location = useLocation();
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderID, setOrderID] = useState(null); // Fixed useState syntax

    // Create a ref to track if the transaction has been processed
    const isSubmittedRef = useRef(false);

    useEffect(() => {
        // First, check if we already have processed this transaction from localStorage
        const processedTransactionId = localStorage.getItem(
            "processedTransactionId"
        );
        const queryParams = new URLSearchParams(location.search);
        const transactionId = queryParams.get("vnp_TxnRef");
        const responseCode = queryParams.get("vnp_ResponseCode");

        // If we've already processed this exact transaction or our ref says we've submitted
        if (
            (processedTransactionId === transactionId && transactionId) ||
            isSubmittedRef.current
        ) {
            console.log(
                "Transaction already processed, loading from localStorage"
            );

            // Just load details from localStorage and exit early
            const lastTransaction = localStorage.getItem("lastTransaction");
            if (lastTransaction) {
                const parsedTransaction = JSON.parse(lastTransaction);
                setTransactionDetails(parsedTransaction);

                // Also load the order ID if available
                const savedOrderId = localStorage.getItem(
                    "lastProcessedOrderId"
                );
                if (savedOrderId) {
                    setOrderID(savedOrderId);
                }
            }
            setLoading(false);
            return;
        }

        const processQueryParams = async () => {
            try {
                // Only process VNPAY parameters if we have them and haven't processed this transaction yet
                if (transactionId && responseCode) {
                    // Extract all relevant VNPAY parameters
                    const transactionDetails = {
                        success: responseCode === "00", // '00' means successful payment
                        responseCode: responseCode,
                        transactionId: transactionId || "N/A",
                        transactionNo:
                            queryParams.get("vnp_TransactionNo") || "N/A",
                        amount:
                            parseInt(queryParams.get("vnp_Amount") || 0) / 100, // VNPAY returns amount * 100
                        bankCode: queryParams.get("vnp_BankCode") || "N/A",
                        paymentMethod: "VNPAY",
                        paymentDate:
                            formatVNPayDate(queryParams.get("vnp_PayDate")) ||
                            currentDateTime,
                        orderInfo: queryParams.get("vnp_OrderInfo") || "N/A",
                        orderId:
                            extractOrderIdFromInfo(
                                queryParams.get("vnp_OrderInfo")
                            ) || "N/A",
                        responseMessage: getResponseMessage(responseCode)
                    };

                    // Mark this transaction as submitted in localStorage immediately
                    localStorage.setItem(
                        "processedTransactionId",
                        transactionId
                    );
                    localStorage.setItem(
                        "lastTransaction",
                        JSON.stringify(transactionDetails)
                    );
                    setTransactionDetails(transactionDetails);

                    // Set the ref to prevent double processing
                    isSubmittedRef.current = true;

                    // Process the order only if payment was successful and not already processed
                    if (transactionDetails.success) {
                        try {
                            const pendingOrder = JSON.parse(
                                localStorage.getItem("pendingOrder")
                            );

                            if (!pendingOrder) {
                                throw new Error("No pending order found");
                            }

                            console.log(
                                "Processing order for user:",
                                pendingOrder.user
                            );

                            // Format the order data to match API expectations
                            const formattedOrder = {
                                user: pendingOrder.user,
                                items: pendingOrder.items.map((item) => ({
                                    product: item.product,
                                    size: item.size,
                                    quantity: item.quantity,
                                    price: item.price
                                })),
                                totalAmount: pendingOrder.totalAmount,
                                shipping: pendingOrder.shipping,
                                couponCode: pendingOrder.couponCode,
                                discount: pendingOrder.discount,
                                finalAmount: pendingOrder.finalAmount,
                                paymentStatus: "Paid",
                                orderStatus: "Processing",
                                statusHistory: [
                                    {
                                        status: "Processing",
                                        timestamp: new Date().toISOString(),
                                        note: "Order placed and payment completed via VNPAY"
                                    }
                                ],
                                shippingAddress: pendingOrder.shippingAddress,
                                paymentMethod: "VNPay",
                                paymentDetails: {
                                    transactionId:
                                        transactionDetails.transactionId,
                                    paymentDate: transactionDetails.paymentDate,
                                    bankCode: transactionDetails.bankCode,
                                    responseCode:
                                        transactionDetails.responseCode
                                },
                                customerNotes: pendingOrder.customerNotes || "",
                                orderedAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };

                            // Call API to create order
                            const createdOrder = await orderService.createOrder(
                                formattedOrder
                            );
                            console.log(
                                "Order created successfully:",
                                createdOrder
                            );

                            // Handle different API response structures
                            const newOrderId = createdOrder.order
                                ? createdOrder.order._id
                                : createdOrder._id;

                            // Store order ID and update transaction details
                            localStorage.setItem(
                                "lastProcessedOrderId",
                                newOrderId
                            );
                            setOrderID(newOrderId);

                            // Clear pending order AFTER successful order creation
                            localStorage.removeItem("pendingOrder");

                            // Update transaction details with order ID
                            setTransactionDetails((prev) => ({
                                ...prev,
                                orderId: newOrderId
                            }));

                            // Store the updated transaction details
                            localStorage.setItem(
                                "lastTransaction",
                                JSON.stringify({
                                    ...transactionDetails,
                                    orderId: newOrderId
                                })
                            );

                            // Clear cart in the background
                            try {
                                await cartService.clearCart();
                                console.log("Cart cleared successfully");
                            } catch (cartError) {
                                console.error(
                                    "Error clearing cart:",
                                    cartError
                                );
                                // Continue even if cart clear fails
                            }
                        } catch (error) {
                            console.error("Error creating order:", error);
                            setTransactionDetails((prev) => ({
                                ...prev,
                                errorMessage: `Failed to create order: ${error.message}`
                            }));
                        }
                    }
                } else {
                    // No VNPAY parameters - check if we have stored transaction details
                    const lastTransaction =
                        localStorage.getItem("lastTransaction");
                    if (lastTransaction) {
                        setTransactionDetails(JSON.parse(lastTransaction));

                        // Also load the order ID if available
                        const savedOrderId = localStorage.getItem(
                            "lastProcessedOrderId"
                        );
                        if (savedOrderId) {
                            setOrderID(savedOrderId);
                        }
                    } else {
                        // No transaction information available, use location state as fallback
                        const state = location.state || {};
                        setTransactionDetails({
                            success: state.success || false,
                            responseCode: state.responseCode || "N/A",
                            transactionId: state.transactionId || "N/A",
                            amount: state.amount || 0,
                            paymentMethod: state.paymentMethod || "N/A",
                            orderInfo: state.orderInfo || "N/A",
                            responseMessage:
                                state.responseMessage ||
                                "Transaction information not available"
                        });
                    }
                }
            } catch (error) {
                console.error("Error processing query parameters:", error);
                setTransactionDetails({
                    success: false,
                    responseMessage: "Error processing transaction details"
                });
            } finally {
                setLoading(false);
            }
        };

        processQueryParams();
    }, [location.search]); // Only react to location.search changes, not all location changes

    const extractOrderIdFromInfo = (orderInfo) => {
        if (!orderInfo) return null;

        // Attempt to extract order ID from the format: "Thanh toan cho ma GD:orderId"
        const matches = orderInfo.match(/Thanh toan cho ma GD:(\d+)/);
        return matches ? matches[1] : null;
    };

    // Format VNPAY date (yyyyMMddHHmmss) to readable format
    const formatVNPayDate = (vnpayDate) => {
        if (!vnpayDate) return null;

        try {
            const year = vnpayDate.substring(0, 4);
            const month = vnpayDate.substring(4, 6);
            const day = vnpayDate.substring(6, 8);
            const hour = vnpayDate.substring(8, 10);
            const minute = vnpayDate.substring(10, 12);
            const second = vnpayDate.substring(12, 14);

            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        } catch (err) {
            console.error("Error parsing VNPAY date:", err);
            return null;
        }
    };

    // Get response message based on VNPAY response code
    const getResponseMessage = (responseCode) => {
        const responseMessages = {
            "00": "Transaction Successful",
            "01": "Transaction already paid",
            "02": "Transaction failed",
            "03": "Incorrect merchant code",
            "04": "Invalid transaction signature",
            "05": "Transaction not found",
            "06": "Invalid request parameters",
            "07": "Transaction amount too small",
            "08": "Transaction amount too large",
            "09": "Transaction rejected by bank",
            10: "Incorrect merchant IP",
            11: "Transaction expired",
            12: "Invalid transaction",
            13: "Invalid transaction type",
            24: "Customer cancelled payment",
            51: "Insufficient balance",
            65: "Transaction limit exceeded",
            75: "Bank does not support this service",
            97: "Invalid signature",
            99: "Unknown error"
        };

        return responseMessages[responseCode] || "Transaction Failed";
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    };

    const handleContinueShopping = () => {
        navigate("/");
    };

    const handleViewOrder = () => {
        // Use the order ID from either state or transaction details
        const targetOrderId = orderID || transactionDetails?.orderId;

        if (targetOrderId && targetOrderId !== "N/A") {
            navigate(`/account/orders/`);
        } else {
            navigate("/account/orders");
        }
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Processing your transaction...</p>
            </div>
        );
    }

    return (
        <div className={styles.transactionContainer}>
            <div className={styles.transactionCard} id="printableArea">
                <div className={styles.header}>
                    {transactionDetails?.success ? (
                        <>
                            <CheckCircle
                                className={styles.successIcon}
                                size={60}
                                color="#4CAF50"
                            />
                            <h1 className={styles.title}>
                                Transaction Successful!
                            </h1>
                            <p className={styles.subtitle}>
                                Thank you for your purchase, {currentUser}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={styles.failedIcon}>❌</div>
                            <h1 className={styles.titleFailed}>
                                Transaction Failed
                            </h1>
                            <p className={styles.subtitle}>
                                Your payment could not be processed
                            </p>
                        </>
                    )}
                </div>

                <div className={styles.receiptContainer}>
                    <h2 className={styles.receiptTitle}>Payment Receipt</h2>

                    <div className={styles.receiptGrid}>
                        <div className={styles.leftColumn}>
                            <div className={styles.receiptRow}>
                                <span className={styles.label}>
                                    Transaction ID:
                                </span>
                                <span className={styles.value}>
                                    {transactionDetails?.transactionId || "N/A"}
                                </span>
                            </div>

                            {transactionDetails?.transactionNo && (
                                <div className={styles.receiptRow}>
                                    <span className={styles.label}>
                                        Transaction No:
                                    </span>
                                    <span className={styles.value}>
                                        {transactionDetails.transactionNo}
                                    </span>
                                </div>
                            )}

                            {/* Show order ID from either source */}
                            {(orderID ||
                                (transactionDetails?.orderId &&
                                    transactionDetails.orderId !== "N/A")) && (
                                <div className={styles.receiptRow}>
                                    <span className={styles.label}>
                                        Order ID:
                                    </span>
                                    <span className={styles.value}>
                                        {orderID || transactionDetails.orderId}
                                    </span>
                                </div>
                            )}

                            <div className={styles.receiptRow}>
                                <span className={styles.label}>Amount:</span>
                                <span className={styles.valueHighlighted}>
                                    {formatCurrency(
                                        transactionDetails?.amount || 0
                                    )}
                                </span>
                            </div>

                            <div className={styles.receiptRow}>
                                <span className={styles.label}>
                                    Payment Method:
                                </span>
                                <span className={styles.value}>
                                    {transactionDetails?.paymentMethod || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            {transactionDetails?.bankCode &&
                                transactionDetails.bankCode !== "N/A" && (
                                    <div className={styles.receiptRow}>
                                        <span className={styles.label}>
                                            Bank:
                                        </span>
                                        <span className={styles.value}>
                                            {transactionDetails.bankCode}
                                        </span>
                                    </div>
                                )}

                            <div className={styles.receiptRow}>
                                <span className={styles.label}>Date:</span>
                                <span className={styles.value}>
                                    {transactionDetails?.paymentDate ||
                                        currentDateTime}
                                </span>
                            </div>

                            <div className={styles.receiptRow}>
                                <span className={styles.label}>Status:</span>
                                <span
                                    className={`${styles.value} ${
                                        transactionDetails?.success
                                            ? styles.statusSuccess
                                            : styles.statusFailed
                                    }`}
                                >
                                    {transactionDetails?.success
                                        ? "Successful"
                                        : "Failed"}
                                </span>
                            </div>

                            {transactionDetails?.responseCode && (
                                <div className={styles.receiptRow}>
                                    <span className={styles.label}>
                                        Response Code:
                                    </span>
                                    <span className={styles.value}>
                                        {transactionDetails.responseCode}
                                    </span>
                                </div>
                            )}

                            {transactionDetails?.responseMessage && (
                                <div className={styles.receiptRow}>
                                    <span className={styles.label}>
                                        Message:
                                    </span>
                                    <span className={styles.value}>
                                        {transactionDetails.responseMessage}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {transactionDetails?.orderInfo &&
                        transactionDetails.orderInfo !== "N/A" && (
                            <div className={styles.orderInfoSection}>
                                <p className={styles.orderInfo}>
                                    {transactionDetails.orderInfo}
                                </p>
                            </div>
                        )}
                </div>

                <div className={styles.actions}>
                    {transactionDetails?.success ? (
                        <>
                            <button
                                className={`${styles.button} ${styles.primaryButton}`}
                                onClick={handleViewOrder}
                            >
                                <ShoppingBag size={16} />
                                View Order
                            </button>

                            <button
                                className={`${styles.button} ${styles.secondaryButton}`}
                                onClick={handlePrintReceipt}
                            >
                                <Printer size={16} />
                                Print Receipt
                            </button>

                            <button
                                className={`${styles.button} ${styles.outlineButton}`}
                                onClick={handleContinueShopping}
                            >
                                <ArrowLeft size={16} />
                                Continue Shopping
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className={`${styles.button} ${styles.primaryButton}`}
                                onClick={() => navigate("/checkout/payment")}
                            >
                                Try Again
                            </button>

                            <button
                                className={`${styles.button} ${styles.outlineButton}`}
                                onClick={handleContinueShopping}
                            >
                                <ArrowLeft size={16} />
                                Continue Shopping
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.timestamp}>{currentDateTime}</div>

                <div className={styles.username}>{currentUser}</div>
            </div>
        </div>
    );
};

export default TransactionSuccess;
