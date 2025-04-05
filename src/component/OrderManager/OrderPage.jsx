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
    RefreshCw,
    ChevronLeft
} from "lucide-react";
import orderService from "@apis/orderService.js";
import styles from "./OrderPage.module.scss";

const OrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

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

    const fetchOrders = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);

                // Build query parameters to match backend
                const params = new URLSearchParams();
                params.set("page", page);
                params.set("limit", 10); // You can make this configurable

                // Add status filter if not "all"
                if (activeTab !== "all") {
                    params.set("orderStatus", activeTab);
                }

                // Add date range filters if provided
                if (dateRange.from) {
                    params.set("startDate", dateRange.from);
                }

                if (dateRange.to) {
                    params.set("endDate", dateRange.to);
                }

                // Call backend with query params
                const response = await orderService.getUserOrders(
                    params.toString()
                );

                // Check if response matches expected structure
                if (response && response.success) {
                    setOrders(response.orders);
                    setPagination({
                        currentPage: response.currentPage,
                        totalPages: response.totalPages,
                        total: response.total
                    });
                    setError(null);
                } else {
                    throw new Error(
                        response?.message || "Failed to fetch orders"
                    );
                }
            } catch (err) {
                setError("Failed to load orders. Please try again.");
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        },
        [activeTab, dateRange]
    );

    useEffect(() => {
        // Reset to page 1 when filters change
        fetchOrders(1);
    }, [activeTab, fetchOrders]);

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
        // Fetch orders with cleared filters
        fetchOrders(1);
    };

    const handleRefresh = () => {
        fetchOrders(pagination.currentPage);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            fetchOrders(page);
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
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
        }).format(amount || 0);
    };

    // Client-side search filtering
    const filteredOrders = orders.filter((order) => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        const matchesId = order?._id?.toLowerCase().includes(searchLower);
        const matchesItems = order?.items?.some((item) =>
            item?.product?.name?.toLowerCase().includes(searchLower)
        );
        const matchesAddress =
            order?.shippingAddress?.street
                ?.toLowerCase()
                .includes(searchLower) ||
            order?.shippingAddress?.district
                ?.toLowerCase()
                .includes(searchLower) ||
            order?.shippingAddress?.cityOrProvince
                ?.toLowerCase()
                .includes(searchLower);

        return matchesId || matchesItems || matchesAddress;
    });

    // Client-side sorting
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        switch (sortOption) {
            case "newest":
                return (
                    new Date(b?.orderedAt || 0) - new Date(a?.orderedAt || 0)
                );
            case "oldest":
                return (
                    new Date(a?.orderedAt || 0) - new Date(b?.orderedAt || 0)
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
                    <span>{pagination.total} orders found</span>
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
                                className={styles.applyFiltersButton}
                                onClick={() => fetchOrders(1)}
                            >
                                Apply Filters
                            </button>
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
                ) : sortedOrders.length > 0 ? (
                    <div className={styles.ordersScrollContent}>
                        {sortedOrders.map((order) => (
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
                                            {order.shippingAddress
                                                .cityOrProvince || "N/A"}
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

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
                <div className={styles.paginationContainer}>
                    <button
                        className={styles.paginationButton}
                        onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    <div className={styles.pageInfo}>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>

                    <button
                        className={styles.paginationButton}
                        onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                            pagination.currentPage === pagination.totalPages
                        }
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            <div className={styles.pageFooter}>
                {/* <p className={styles.lastUpdated}>
                    Last updated: {currentDateTime}
                </p> */}
            </div>
        </div>
    );
};

export default OrdersPage;
