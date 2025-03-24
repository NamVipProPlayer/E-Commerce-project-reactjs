import React from "react";
import styles from "./OrderSummary.module.scss";
import { FaTruck } from "react-icons/fa";

const OrderSummary = ({
    shippingCost,
    total,
    subtotal,
    items,
    deliveryDate,
    qualifiesForFreeShipping = false, // Add this prop with default
    adjustedTotal, // Add this prop
    isLoading = false
}) => {
    // Format currency with dollar symbol
    const formatCurrency = (amount) => {
        return `${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}$`;
    };

    // Format delivery date range
    const formatDeliveryDate = (start, end) => {
        try {
            const options = {
                weekday: "short",
                month: "short",
                day: "numeric"
            };
            const startStr = start.toLocaleDateString("en-US", options);
            const endStr = end.toLocaleDateString("en-US", options);
            return `${startStr} - ${endStr}`;
        } catch (error) {
            return "Date not available";
        }
    };

    if (isLoading) {
        return (
            <div className={styles.orderSummary}>
                <div className={styles.orderSummaryLoading}>
                    Loading order summary...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.orderSummary}>
            <h2 className={styles.orderSummaryTitle}>Order Summary</h2>

            <div className={styles.orderSummaryPriceBreakdown}>
                <div className={styles.orderSummaryPriceRow}>
                    <div className={styles.orderSummarySubtotalLabel}>
                        <span>Subtotal:</span>
                    </div>
                    <span className={styles.orderSummaryPrice}>
                        {formatCurrency(subtotal)}
                    </span>
                </div>

                <div className={styles.orderSummaryPriceRow}>
                    <span>Delivery/Shipping</span>

                    <span
                        className={
                            qualifiesForFreeShipping
                                ? styles.orderSummaryFreeShipping
                                : styles.orderSummaryPrice
                        }
                    >
                        {qualifiesForFreeShipping
                            ? "FREE"
                            : formatCurrency(shippingCost)}
                    </span>
                </div>
                <div className={styles.shippingNote}>
                    Free for orders more than 500$
                </div>
            </div>

            {qualifiesForFreeShipping && (
                <div className={styles.orderSummaryShippingMessage}>
                    <p>
                        <FaTruck className={styles.truckIcon} /> You qualify for
                        free shipping!
                    </p>
                </div>
            )}

            <div className={styles.orderSummaryTotal}>
                <div className={styles.orderSummaryTotalRow}>
                    <span className={styles.orderSummaryTotalLabel}>Total</span>
                    <span className={styles.orderSummaryTotalPrice}>
                        {formatCurrency(adjustedTotal)}
                    </span>
                </div>
            </div>

            <div className={styles.orderSummaryDelivery}>
                <p className={styles.orderSummaryDeliveryDate}>
                    {deliveryDate && deliveryDate.start && deliveryDate.end ? (
                        <>
                            Arrives{" "}
                            {formatDeliveryDate(
                                deliveryDate.start,
                                deliveryDate.end
                            )}
                        </>
                    ) : (
                        "Delivery date will be confirmed after order"
                    )}
                </p>

                <div className={styles.orderSummaryItems}>
                    {items &&
                        items.map((item, index) => (
                            <div
                                key={item.id || index}
                                className={styles.orderSummaryItem}
                            >
                                <div className={styles.orderSummaryItemImage}>
                                    <img
                                        src={item.fSrc}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "/placeholder-image.jpg";
                                        }}
                                    />
                                </div>
                                <div className={styles.orderSummaryItemDetails}>
                                    <h3 className={styles.orderSummaryItemName}>
                                        {item.name}
                                    </h3>
                                    <p className={styles.orderSummaryItemMeta}>
                                        Qty {item.quantity}
                                    </p>
                                    <p className={styles.orderSummaryItemMeta}>
                                        Size {item.size}
                                    </p>
                                    <p className={styles.orderSummaryItemPrice}>
                                        {formatCurrency(item.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
