import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    CheckCircle,
    Truck,
    Package,
    XCircle,
    AlertTriangle,
    RefreshCw,
    ArrowLeft
} from "lucide-react";
import orderService from "@apis/orderService.js";
import shoesProductService from "@apis/shoesProductService.js"; // Added import for shoes product service
import styles from "./OrderDetail.module.scss";

const OrderDetails = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [actionMessage, setActionMessage] = useState({
        type: "",
        message: ""
    });
    const [reason, setReason] = useState("");
    // State to store product images
    const [productImages, setProductImages] = useState({});

    // Current date and time (consistent with provided format)
    const currentDateTime = "2025-03-08 06:40:27";
    const currentUser = "NamProPlayer20";

    // Debug logging for component mount and orderID
    useEffect(() => {
        console.log("=====================================");
        console.log("OrderDetails component mounted");
        console.log("OrderID from params:", orderId);
        console.log("Current date:", currentDateTime);
        console.log("Current user:", currentUser);

        return () => {
            console.log("OrderDetails component unmounted");
        };
    }, [orderId, currentDateTime]);

    // Fetch order details with proper handling of the API response structure
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            console.error("No order ID provided");
            setError("No order ID provided");
            setLoading(false);
            return;
        }

        try {
            console.log("Starting API request for order:", orderId);
            setLoading(true);

            const requestUrl = `/api/order/${orderId}`;
            console.log("API request URL:", requestUrl);

            // Now try the service call
            const response = await orderService.getOrderById(orderId);
            console.log("Service API response received:", response);

            if (!response) {
                throw new Error("No data returned from API");
            }

            // Handle the nested response structure - extract order from {success, order}
            let orderData;
            if (response.success && response.order) {
                // API returns {success: true, order: {...}}
                orderData = response.order;
                console.log(
                    "Extracted order data from success response:",
                    orderData
                );
            } else if (response._id) {
                // API directly returns the order object
                orderData = response;
                console.log("Using direct order data:", orderData);
            } else {
                throw new Error("Invalid order data format returned from API");
            }

            setOrder(orderData);
            console.log("Order state updated with:", orderData);

            // After loading order, fetch product images
            if (orderData.items && orderData.items.length > 0) {
                fetchProductImages(orderData.items);
            }

            setError(null);
        } catch (err) {
            console.error("🚨 Error fetching order:", err);
            console.error("Error message:", err.message);
            console.error("Error stack:", err.stack);

            if (err.response) {
                console.error("API error response:", {
                    status: err.response.status,
                    data: err.response.data,
                    headers: err.response.headers
                });
            }

            setError(`Failed to load order details: ${err.message}`);
        } finally {
            setLoading(false);
            console.log("Order fetching completed, loading set to false");
        }
    }, [orderId]);

    // New function to fetch product images
    const fetchProductImages = async (items) => {
        console.log("Fetching product images for items:", items);
        const imagePromises = items.map(async (item) => {
            if (!item.product || !item.product._id) {
                console.log("Item has no valid product ID:", item);
                return null;
            }

            try {
                console.log(
                    `Fetching image for product ID: ${item.product._id}`
                );
                const productData =
                    await shoesProductService.getShoeProductById(
                        item.product._id
                    );
                console.log("Product data received:", productData);

                if (productData && productData.fSrc) {
                    return {
                        productId: item.product._id,
                        imageUrl: productData.fSrc
                    };
                } else {
                    console.log("No fSrc found in product data:", productData);
                    return null;
                }
            } catch (error) {
                console.error(
                    `Error fetching image for product ${item.product._id}:`,
                    error
                );
                return null;
            }
        });

        try {
            const results = await Promise.all(imagePromises);
            console.log("All product image fetch results:", results);

            // Filter out null results and build image map
            const imagesMap = {};
            results.filter(Boolean).forEach((result) => {
                imagesMap[result.productId] = result.imageUrl;
            });

            console.log("Final product images map:", imagesMap);
            setProductImages(imagesMap);
        } catch (error) {
            console.error("Error fetching product images:", error);
        }
    };

    // Call fetchOrderDetails in useEffect
    useEffect(() => {
        console.log("Fetch effect triggered with orderId:", orderId);
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // Handlers and utility functions remain the same
    const handleCancelRequest = () => {
        setActionType("cancel");
        setShowConfirmModal(true);
    };

    const handleRefundRequest = () => {
        setActionType("refund");
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        setProcessingAction(true);
        try {
            if (actionType === "cancel") {
                await orderService.cancelOrder(orderId, { reason });
                setOrder((prev) => ({
                    ...prev,
                    orderStatus: "Cancelled",
                    statusHistory: [
                        ...(prev.statusHistory || []),
                        {
                            status: "Cancelled",
                            timestamp: new Date().toISOString(),
                            note: `Order cancelled by user. Reason: ${reason}`
                        }
                    ]
                }));
                setActionMessage({
                    type: "success",
                    message: "Order successfully cancelled"
                });
            } else if (actionType === "refund") {
                await orderService.requestRefund(orderId, { reason });
                setOrder((prev) => ({
                    ...prev,
                    paymentStatus: "Refunded",
                    statusHistory: [
                        ...(prev.statusHistory || []),
                        {
                            status: "Refund Requested",
                            timestamp: new Date().toISOString(),
                            note: `Refund requested by user. Reason: ${reason}`
                        }
                    ]
                }));
                setActionMessage({
                    type: "success",
                    message: "Refund request submitted successfully"
                });
            }
        } catch (err) {
            setActionMessage({
                type: "error",
                message: `Failed to ${
                    actionType === "cancel" ? "cancel order" : "request refund"
                }. Please try again.`
            });
            console.error(`Error during ${actionType}:`, err);
        } finally {
            setProcessingAction(false);
            setShowConfirmModal(false);
            setReason("");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Processing":
                return <RefreshCw className={styles.processingIcon} />;
            case "Shipped":
                return <Truck className={styles.shippedIcon} />;
            case "Delivered":
                return <CheckCircle className={styles.deliveredIcon} />;
            case "Cancelled":
                return <XCircle className={styles.cancelledIcon} />;
            default:
                return <Package />;
        }
    };

    const getPaymentStatusClass = (status) => {
        switch (status) {
            case "Paid":
                return styles.statusPaid;
            case "Failed":
                return styles.statusFailed;
            case "Refunded":
                return styles.statusRefunded;
            case "Pending":
            default:
                return styles.statusPending;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            };
            return new Date(dateString).toLocaleDateString("en-US", options);
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString.toString();
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    };

    // Determine if user can cancel order
    const canCancel = order && order.orderStatus === "Processing";

    // Determine if user can request refund
    const canRefund =
        order &&
        order.orderStatus === "Delivered" &&
        order.paymentStatus === "Paid" &&
        // Assume refund policy allows refunds within 14 days of delivery
        new Date() - new Date(order.deliveredAt || order.updatedAt) <
            14 * 24 * 60 * 60 * 1000;

    console.log("Rendering with state:", {
        loading,
        error,
        hasOrder: !!order,
        hasImages: Object.keys(productImages).length
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className={styles.errorContainer}>
                <AlertTriangle size={48} />
                <h2>Error</h2>
                <p>{error || "Order not found"}</p>
                <button
                    className={styles.backButton}
                    onClick={() => navigate("/account/orders")}
                >
                    <ArrowLeft size={16} />
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className={styles.orderDetailsContainer}>
            {actionMessage.type && (
                <div
                    className={`${styles.alert} ${styles[actionMessage.type]}`}
                >
                    {actionMessage.message}
                    <button
                        className={styles.closeAlert}
                        onClick={() =>
                            setActionMessage({ type: "", message: "" })
                        }
                    >
                        ×
                    </button>
                </div>
            )}

            <div className={styles.header}>
                <h1>Order Details</h1>
                <div className={styles.orderMeta}>
                    <span>Order #{order._id}</span>
                    <span>Placed on {formatDate(order.orderedAt)}</span>
                </div>
            </div>

            <div className={styles.statusContainer}>
                <div className={styles.statusCard}>
                    <div className={styles.statusHeader}>
                        <div className={styles.statusIconContainer}>
                            {getStatusIcon(order.orderStatus)}
                        </div>
                        <div className={styles.statusInfo}>
                            <h2>Order Status</h2>
                            <div
                                className={`${styles.statusBadge} ${
                                    order.orderStatus
                                        ? styles[
                                              order.orderStatus.toLowerCase()
                                          ] || styles.unknown
                                        : styles.unknown
                                }`}
                            >
                                {order.orderStatus || "Unknown"}
                            </div>
                        </div>
                    </div>
                    <div className={styles.lastUpdated}>
                        Last updated: {formatDate(order.updatedAt)}
                    </div>
                </div>

                <div className={styles.paymentCard}>
                    <h2>Payment Status</h2>
                    <div
                        className={`${
                            styles.paymentBadge
                        } ${getPaymentStatusClass(order.paymentStatus)}`}
                    >
                        {order.paymentStatus}
                    </div>
                    {order.paymentDetails && (
                        <div className={styles.paymentInfo}>
                            <p>Method: {order.paymentMethod || "N/A"}</p>
                            {order.paymentDetails.transactionId && (
                                <p>
                                    Transaction ID:{" "}
                                    {order.paymentDetails.transactionId}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.orderItems}>
                <h2>Order Items</h2>
                {order.items &&
                    order.items.map((item, index) => {
                        // Get product image from the productImages state or fallback to product.images
                        const productId = item.product?._id;
                        const productImage =
                            productId && productImages[productId]
                                ? productImages[productId]
                                : item.product?.images &&
                                  item.product.images[0];

                        return (
                            <div className={styles.itemCard} key={index}>
                                <div className={styles.itemImage}>
                                    {productImage ? (
                                        <img
                                            src={productImage}
                                            alt={item.product.name}
                                            className={styles.productImage}
                                        />
                                    ) : (
                                        <div className={styles.noImage}>
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <h3>
                                        {item.product
                                            ? item.product.name
                                            : "Unknown Product"}
                                    </h3>
                                    <div className={styles.itemMeta}>
                                        <span>Size: {item.size || "N/A"}</span>
                                        <span>
                                            Quantity: {item.quantity || 0}
                                        </span>
                                        <span>
                                            Price: {formatCurrency(item.price)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.itemPrice}>
                                    {formatCurrency(
                                        (item.price || 0) * (item.quantity || 0)
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className={styles.orderSummary}>
                <h2>Order Summary</h2>
                <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping)}</span>
                </div>
                {order.discount !== 0 && order.discount !== undefined && (
                    <div className={styles.summaryRow}>
                        <span>
                            Discount{" "}
                            {order.couponCode && `(${order.couponCode})`}
                        </span>
                        <span>{formatCurrency(Math.abs(order.discount))}</span>
                    </div>
                )}
                <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total</span>
                    <span>{formatCurrency(order.finalAmount)}</span>
                </div>
            </div>

            {order.shippingAddress && (
                <div className={styles.shippingInfo}>
                    <h2>Shipping Information</h2>
                    <div className={styles.addressCard}>
                        <h3>Delivery Address:</h3>
                        <p>
                            {order.shippingAddress.fullName ||
                                order.user?.name ||
                                "N/A"}
                        </p>
                        <p>{order.shippingAddress.street || "N/A"}
                        ,{" "}
                            {order.shippingAddress.city ||
                                order.shippingAddress.cityOrProvince ||
                                "N/A"}
                            ,{" "}
                            {order.shippingAddress.state ||
                                order.shippingAddress.district ||
                                "N/A"}{" "}
                        
                        </p>
                       
                        <p>Phone: {order.shippingAddress.phoneNumber || "N/A"}</p>
                    </div>
                </div>
            )}

            <div className={styles.orderTimeline}>
                <h2>Order History</h2>
                <div className={styles.timeline}>
                    {order.statusHistory && order.statusHistory.length > 0 ? (
                        order.statusHistory.map((statusItem, index) => (
                            <div className={styles.timelineItem} key={index}>
                                <div className={styles.timelinePoint}></div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineHeader}>
                                        <h3>{statusItem.status}</h3>
                                        <span>
                                            {formatDate(statusItem.timestamp)}
                                        </span>
                                    </div>
                                    {statusItem.note && (
                                        <p>{statusItem.note}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyTimeline}>
                            <p>No status history available</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.actionButtons}>
                {canCancel && (
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={handleCancelRequest}
                        disabled={processingAction}
                    >
                        <XCircle size={16} />
                        Cancel Order
                    </button>
                )}

                {canRefund && (
                    <button
                        className={`${styles.button} ${styles.refundButton}`}
                        onClick={handleRefundRequest}
                        disabled={processingAction}
                    >
                        <RefreshCw size={16} />
                        Request Refund
                    </button>
                )}

                <button
                    className={`${styles.button} ${styles.backButton}`}
                    onClick={() => navigate("/account/orders")}
                >
                    <ArrowLeft size={16} />
                    Back to Orders
                </button>
            </div>

            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>
                            {actionType === "cancel"
                                ? "Cancel Order"
                                : "Request Refund"}
                        </h2>
                        <p>
                            {actionType === "cancel"
                                ? "Are you sure you want to cancel this order? This action cannot be undone."
                                : "Please provide a reason for your refund request:"}
                        </p>

                        <div className={styles.formGroup}>
                            <label htmlFor="reason">Reason:</label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder={`Please provide a reason for ${
                                    actionType === "cancel"
                                        ? "cancellation"
                                        : "refund"
                                }...`}
                                required
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelActionBtn}
                                onClick={() => setShowConfirmModal(false)}
                                disabled={processingAction}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmActionBtn}
                                onClick={handleConfirmAction}
                                disabled={processingAction || !reason.trim()}
                            >
                                {processingAction
                                    ? "Processing..."
                                    : actionType === "cancel"
                                    ? "Confirm Cancellation"
                                    : "Submit Refund Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
