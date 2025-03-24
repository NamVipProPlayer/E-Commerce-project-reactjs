import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    CheckCircle,
    Truck,
    Package,
    XCircle,
    Search,
    ChevronRight,
    Calendar,
    Clock,
    Filter,
    RefreshCw
} from "lucide-react";
import orderService from "@apis/orderService.js";
import styles from "./OrderPage.module.scss";

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get the active tab from URL or default to "all"
    const queryParams = new URLSearchParams(location.search);
    const defaultTab = queryParams.get("status") || "all";

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: "",
        to: ""
    });

    // Current user and date information
    const currentUser = "NamProPlayer20";
    const currentDateTime = "2025-03-08 07:00:10";

    const tabs = [
        { id: "all", label: "All Orders" },
        { id: "Processing", label: "Processing" },
        { id: "Shipped", label: "Shipped" },
        { id: "Delivered", label: "Delivered" },
        { id: "Cancelled", label: "Cancelled" }
    ];

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            // Get all orders for the current user
            const data = await orderService.getUserOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError("Failed to load orders. Please try again.");
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        // Update URL when tab changes
        const params = new URLSearchParams(location.search);
        if (activeTab === "all") {
            params.delete("status");
        } else {
            params.set("status", activeTab);
        }
        navigate({ search: params.toString() }, { replace: true });
    }, [activeTab, navigate, location.search]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setSortOption("newest");
        setDateRange({ from: "", to: "" });
    };

    const handleRefresh = () => {
        fetchOrders();
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

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric"
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    };

    // Filter and sort the orders
    const filteredOrders = orders
        .filter((order) => {
            // Filter by status (with null check)
            if (activeTab !== "all" && order?.orderStatus !== activeTab) {
                return false;
            }

            // Search by order ID, items or address (with null checks)
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchesId = order?._id
                    ?.toLowerCase()
                    .includes(searchLower);
                const matchesItems = order?.items?.some((item) =>
                    item?.product?.name?.toLowerCase().includes(searchLower)
                );
                const matchesAddress =
                    order?.shippingAddress?.street
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    order?.shippingAddress?.city
                        ?.toLowerCase()
                        .includes(searchLower);

                if (!(matchesId || matchesItems || matchesAddress)) {
                    return false;
                }
            }

            // Filter by date range (with null check)
            if (dateRange.from && order?.orderedAt) {
                if (new Date(order.orderedAt) < new Date(dateRange.from)) {
                    return false;
                }
            }
            if (dateRange.to && order?.orderedAt) {
                if (new Date(order.orderedAt) > new Date(dateRange.to)) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            switch (sortOption) {
                case "newest":
                    return (
                        new Date(b?.orderedAt || 0) -
                        new Date(a?.orderedAt || 0)
                    );
                case "oldest":
                    return (
                        new Date(a?.orderedAt || 0) -
                        new Date(b?.orderedAt || 0)
                    );
                case "highToLow":
                    return (b?.finalAmount || 0) - (a?.finalAmount || 0);
                case "lowToHigh":
                    return (a?.finalAmount || 0) - (b?.finalAmount || 0);
                default:
                    return 0;
            }
        });

    // Group orders by status for tab counts
    const orderCounts = orders.reduce(
        (acc, order) => {
            if (order && order.orderStatus) {
                acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
            }
            return acc;
        },
        { all: orders.length }
    );

    return (
        <div className={styles.ordersPageContainer}>
            <div className={styles.header}>
                <h1>My Orders</h1>
                {/* <div className={styles.orderCount}>
                    <span>{filteredOrders.length} orders found</span>
                </div> */}
                <div className={styles.headerActions}>
                    <button
                        className={styles.refreshButton}
                        onClick={handleRefresh}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <div className={styles.tabsScroller}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${
                                activeTab === tab.id ? styles.active : ""
                            }`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                            {orderCounts[tab.id] !== undefined && (
                                <span className={styles.tabCount}>
                                    {orderCounts[tab.id]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.filtersContainer}>
                <div className={styles.searchContainer}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search orders by ID, product, or address..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>

                <button
                    className={styles.filterToggle}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={16} />
                    Filters {showFilters ? "▲" : "▼"}
                </button>

                {showFilters && (
                    <div className={styles.advancedFilters}>
                        <div className={styles.filterRow}>
                            <div className={styles.filterGroup}>
                                <label>Date Range</label>
                                <div className={styles.dateInputs}>
                                    <div className={styles.dateField}>
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            name="from"
                                            value={dateRange.from}
                                            onChange={handleDateChange}
                                            placeholder="From"
                                        />
                                    </div>
                                    <div className={styles.dateField}>
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            name="to"
                                            value={dateRange.to}
                                            onChange={handleDateChange}
                                            placeholder="To"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Sort By</label>
                                <div className={styles.selectContainer}>
                                    <select
                                        value={sortOption}
                                        onChange={handleSortChange}
                                    >
                                        <option value="newest">
                                            Newest First
                                        </option>
                                        <option value="oldest">
                                            Oldest First
                                        </option>
                                        <option value="highToLow">
                                            Price: High to Low
                                        </option>
                                        <option value="lowToHigh">
                                            Price: Low to High
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.filterActions}>
                            <button
                                className={styles.clearFiltersButton}
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main content container with scrollable orders */}
            <div className={styles.scrollableOrdersContainer}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorMessage}>{error}</p>
                        <button
                            className={styles.retryButton}
                            onClick={fetchOrders}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className={styles.ordersScrollContent}>
                        {filteredOrders.map((order) => (
                            <Link
                                to={`/account/orders/${order._id}`}
                                className={styles.orderCard}
                                key={order._id}
                            >
                                <div className={styles.orderTopSection}>
                                    <div className={styles.orderStatusSection}>
                                        <div
                                            className={`${
                                                styles.statusIndicator
                                            } ${
                                                order?.orderStatus
                                                    ? styles[
                                                          order.orderStatus.toLowerCase()
                                                      ]
                                                    : styles.unknown
                                            }`}
                                        >
                                            {getStatusIcon(order?.orderStatus)}
                                            <span>
                                                {order?.orderStatus ||
                                                    "Processing"}
                                            </span>
                                        </div>
                                        <span className={styles.orderDate}>
                                            <Clock size={14} />
                                            {formatDate(order.orderedAt)}
                                        </span>
                                    </div>

                                    <div className={styles.orderIdSection}>
                                        <span className={styles.orderId}>
                                            Order #{order._id.slice(-8)}
                                        </span>
                                        <span className={styles.orderAmount}>
                                            {formatCurrency(order.finalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.orderItemsPreview}>
                                    {order.items
                                        .slice(0, 3)
                                        .map((item, idx) => (
                                            <div
                                                className={styles.previewItem}
                                                key={idx}
                                            >
                                                <div
                                                    className={
                                                        styles.previewImageContainer
                                                    }
                                                >
                                                    {item.product.images &&
                                                    item.product.images[0] ? (
                                                        <img
                                                            src={
                                                                item.product
                                                                    .images[0]
                                                            }
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.noImage
                                                            }
                                                        >
                                                            <Package
                                                                size={16}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.previewItemDetails
                                                    }
                                                >
                                                    <p
                                                        className={
                                                            styles.itemName
                                                        }
                                                    >
                                                        {item.product.name}
                                                    </p>
                                                    <div
                                                        className={
                                                            styles.itemMeta
                                                        }
                                                    >
                                                        <span>
                                                            Size: {item.size}
                                                        </span>
                                                        <span>
                                                            Qty: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {order.items.length > 3 && (
                                        <div className={styles.moreItems}>
                                            +{order.items.length - 3} more items
                                        </div>
                                    )}
                                </div>

                                <div className={styles.orderFooter}>
                                    <div className={styles.shippingPreview}>
                                        <Truck size={14} />
                                        <span>
                                            {order.shippingAddress.district ||
                                                "N/A"}
                                            ,{" "}
                                            {order.shippingAddress.city ||
                                                order.shippingAddress
                                                    .cityOrProvince ||
                                                "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.viewDetailsLink}>
                                        <span>View Details</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Package size={48} />
                        <h2>No orders found</h2>
                        <p>
                            {activeTab === "all"
                                ? "You haven't placed any orders yet."
                                : `You don't have any ${activeTab.toLowerCase()} orders.`}
                        </p>
                        <button
                            className={styles.shopNowButton}
                            onClick={() => navigate("/")}
                        >
                            Shop Now
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.pageFooter}>
                <p className={styles.lastUpdated}>
                    Last updated: {currentDateTime}
                </p>
            </div>
        </div>
    );
};

export default OrdersPage;
