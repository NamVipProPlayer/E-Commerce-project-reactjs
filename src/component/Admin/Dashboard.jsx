import { useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import styles from "./stylesAdmin.module.scss";
import {
    Menu,
    X,
    Settings,
    LogOut,
    Package,
    Users,
    AlertCircle,
    ShoppingBag,
    DollarSign,
    Clock,
    CreditCard,
    Truck
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu.jsx";
import { DataTable } from "./DataTable.jsx";
import { ProductForm } from "./ProductForm.jsx";
import { ProductFormUpdate } from "./ProductUpdateForm.jsx";
import { UserForm } from "./UserForm.jsx";
import { UserUpdateForm } from "./UserUpdateFrom.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.jsx";
import { Button } from "./ui/button.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.jsx";
import userService from "@/apis/userService.js";
import shoesProductService from "@/apis/shoesProductService.js";
import orderService from "@/apis/orderService.js";

import { queryClient } from "./lib/queryClient.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@Contexts/AuthContext.jsx";
import { toast } from "react-toastify";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";
import { StorageContext } from "@Contexts/StorageProvider.jsx";
import { OrderUpdateForm } from "@component/Admin/OrderUpdateForm";

// Global constants for application
const CURRENT_DATETIME = getCurrentFormattedDateTime();

export default function Dashboard() {
    const navigate = useNavigate();
    const { userInfo } = useContext(StorageContext);
    const { auth, setAuth } = useContext(AuthContext);
    const [productFormOpen, setProductFormOpen] = useState(false);
    const [userFormOpen, setUserFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updateFormOpen, setUpdateFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updateUserFormOpen, setUpdateUserFormOpen] = useState(false);

    // Order state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailOpen, setOrderDetailOpen] = useState(false);
    const [orderUpdateOpen, setOrderUpdateOpen] = useState(false);

    // Pagination state for orders
    const [orderPage, setOrderPage] = useState(1);
    const [orderPageSize, setOrderPageSize] = useState(10);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [orderTotalItems, setOrderTotalItems] = useState(0);

    // Sidebar visibility state
    const [sidebarVisible, setSidebarVisible] = useState(true);

    // Current user
    const CURRENT_USER = userInfo ? userInfo.name : "NamProPlayer20";

    // Activity logging
    useEffect(() => {
        console.log(
            `Dashboard accessed by ${CURRENT_USER} at ${CURRENT_DATETIME}`
        );
    }, []);

    // Products query
    const {
        data: products = [],
        isLoading: productsLoading,
        error: productsError
    } = useQuery({
        queryKey: ["shoes"],
        queryFn: async () => {
            try {
                const response =
                    await shoesProductService.getAllShoesProducts();

                return response.map((item) => ({
                    _id: item._id || item.id, // Ensure we have a consistent ID field
                    id: item._id || item.id,
                    name: item.name,
                    brand: item.brand,
                    category: item.category || "Uncategorized",
                    description: item.description,
                    price: item.price,
                    stock: item.stock,
                    sizes: item.sizes || [],
                    colors: item.colors || [],
                    size: Array.isArray(item.sizes)
                        ? item.sizes.join(", ")
                        : "N/A",
                    fSrc: item.fSrc,
                    sSrc: item.sSrc
                }));
            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Failed to load products data");
                return [];
            }
        }
    });

    // Users query
    const {
        data: users = [],
        isLoading: usersLoading,
        error: usersError
    } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                const response = await userService.getUsers();

                return response.map((user) => ({
                    _id: user._id,
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    roleId: user.roleId,
                    phone: user.phone || "Not provided",
                    createdAt: user.createdAt || "Unknown"
                }));
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load users data");
                return [];
            }
        },
        enabled: !!auth?.token,
        retry: 1
    });

    // Orders query with pagination
    const {
        data: orderData = {
            orders: [],
            totalPages: 1,
            currentPage: 1,
            total: 0
        },
        isLoading: ordersLoading,
        error: ordersError,
        refetch: refetchOrders
    } = useQuery({
        queryKey: ["orders", orderPage, orderPageSize],
        queryFn: async () => {
            try {
                // Build query string with pagination parameters
                const params = new URLSearchParams({
                    page: orderPage,
                    limit: orderPageSize
                });

                const response = await orderService.getAllOrders(
                    params.toString()
                );

                // Process the response
                if (response && response.success) {
                    const formattedOrders = Array.isArray(response.orders)
                        ? response.orders.map(formatOrderData)
                        : [];

                    // Store pagination metadata
                    setOrderTotalPages(response.totalPages || 1);
                    setOrderTotalItems(response.total || 0);

                    return {
                        orders: formattedOrders,
                        totalPages: response.totalPages || 1,
                        currentPage: response.currentPage || 1,
                        total: response.total || 0
                    };
                } else if (Array.isArray(response)) {
                    // Handle old API format (returns array directly)
                    return {
                        orders: response.map(formatOrderData),
                        totalPages: 1,
                        currentPage: 1,
                        total: response.length
                    };
                } else {
                    // Handle unexpected response format
                    console.warn("Unexpected order response format:", response);
                    return {
                        orders: [],
                        totalPages: 1,
                        currentPage: 1,
                        total: 0
                    };
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders data");
                return { orders: [], totalPages: 1, currentPage: 1, total: 0 };
            }
        },
        enabled: !!auth?.token,
        retry: 1
    });

    // Extract orders array from response
    const orders = orderData.orders || [];

    // Helper function to format order data consistently
    const formatOrderData = (order) => ({
        _id: order._id,
        id: order._id,
        user: order.user,
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        finalAmount: order.finalAmount || order.totalAmount || 0,
        paymentStatus: order.paymentStatus || "Pending",
        orderStatus: order.orderStatus || "Processing",
        paymentMethod: order.paymentMethod || "N/A",
        shippingAddress: order.shippingAddress || {},
        tracking: order.tracking || {},
        customerNotes: order.customerNotes || "",
        orderedAt:
            order.orderedAt || order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt || new Date().toISOString(),
        statusHistory: order.statusHistory || []
    });

    // Product mutations
    const createProductMutation = useMutation({
        mutationFn: async (productData) => {
            setIsSubmitting(true);
            try {
                // Add metadata to the product
                const dataWithMetadata = {
                    ...productData,
                    createdAt: CURRENT_DATETIME,
                    createdBy: CURRENT_USER
                };

                const response = await shoesProductService.createShoeProduct(
                    dataWithMetadata
                );
                toast.success("Product created successfully!");
                return response;
            } catch (error) {
                console.error("Error creating product:", error);
                toast.error(`Failed to create product: ${error.message}`);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shoes"] });
            setProductFormOpen(false);
            setEditingProduct(null);
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            // Fixed parameter structure
            setIsSubmitting(true);
            try {
                // Add metadata to the update
                const dataWithMetadata = {
                    ...data,
                    updatedAt: CURRENT_DATETIME,
                    updatedBy: CURRENT_USER
                };

                const response = await shoesProductService.updateShoeProduct(
                    id,
                    dataWithMetadata
                );
                toast.success("Product updated successfully!");
                return response;
            } catch (error) {
                console.error("Error updating product:", error);
                toast.error(`Failed to update product: ${error.message}`);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shoes"] });
            setProductFormOpen(false);
            setEditingProduct(null);
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await shoesProductService.deleteShoeProduct(
                    id
                );
                toast.success("Product deleted successfully!");
                return response;
            } catch (error) {
                console.error("Error deleting product:", error);
                toast.error(`Failed to delete product: ${error.message}`);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shoes"] });
        }
    });

    // User mutations
    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            setIsSubmitting(true);
            try {
                //Add metadata to the user
                const dataWithMetadata = {
                    ...userData,
                    createdAt: CURRENT_DATETIME,
                    createdBy: CURRENT_USER
                };

                const response = await userService.createUser(dataWithMetadata);

                toast.success("User created successfully!");

                return response;
            } catch (error) {
                console.error("Error creating user:", error);
                toast.error(`Failed to create user: ${error.message}`);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setUserFormOpen(false);
            setEditingUser(null);
        }
    });

    // Handle the user update submission
    const handleUserUpdate = async (userId, updatedData) => {
        try {
            await userService.UpdateUserInfo(userId, updatedData);
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User updated successfully!");
            setUpdateUserFormOpen(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user");
        }
    };

    // Unknown function update user
    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            setIsSubmitting(true);
            try {
                // Add metadata to the update
                const dataWithMetadata = {
                    ...data,
                    updatedAt: CURRENT_DATETIME,
                    updatedBy: CURRENT_USER
                };

                const response = await userService.updateUser(
                    id,
                    dataWithMetadata
                );
                toast.success("User updated successfully!");
                return response;
            } catch (error) {
                console.error("Error updating user:", error);
                toast.error(`Failed to update user: ${error.message}`);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setUserFormOpen(false);
            setEditingUser(null);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await userService.deleteUserAdminRole(id);
                toast.success("User deleted successfully!");
                return response;
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error(`Failed to delete user: ${error.message}`);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        }
    });

    // Order mutations
    const updateOrderMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                console.log("Making API call to update order:", id);
                console.log("Order update data:", data);

                // Don't modify data again here since we've already prepared it
                const response = await orderService.updateOrder(id, data);

                console.log("Order update response:", response);
                toast.success("Order updated successfully!");
                return response;
            } catch (error) {
                console.error("Error updating order:", error);
                toast.error(
                    `Failed to update order: ${
                        error.message || "Unknown error"
                    }`
                );
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setOrderUpdateOpen(false);
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: async (id) => {
            try {
                const response = await orderService.deleteOrder(id);
                toast.success("Order deleted successfully!");
                return response;
            } catch (error) {
                console.error("Error deleting order:", error);
                toast.error(`Failed to delete order: ${error.message}`);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }
    });

    // Product handlers
    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductFormOpen(true);
    };

    // Update Product
    const handleUpdateProduct = (product) => {
        setSelectedProduct(product);
        setUpdateFormOpen(true);
    };

    const handleSubmitProduct = (data) => {
        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    // User handlers
    const handleAddUser = () => {
        setEditingUser(null);
        setUserFormOpen(true);
    };

    const handleUpdateUser = (user) => {
        setSelectedUser(user);
        setUpdateUserFormOpen(true);
    };

    const handleSubmitUser = (data) => {
        if (editingUser) {
            updateUserMutation.mutate({ id: editingUser.id, data });
        } else {
            createUserMutation.mutate(data);
        }
    };

    // Order handlers
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOrderDetailOpen(true);
    };

    const handleUpdateOrder = (order) => {
        setSelectedOrder(order);
        setOrderUpdateOpen(true);
    };

    const handleSubmitOrderUpdate = (orderId, formattedData) => {
        console.log("Submitting order update:", orderId, formattedData);

        // Add metadata that should be added at this level
        const dataWithMetadata = {
            ...formattedData,
            updatedAt: CURRENT_DATETIME,
            updatedBy: CURRENT_USER
        };

        // Only add status history entry if orderStatus changed
        if (
            selectedOrder &&
            formattedData.orderStatus !== selectedOrder.orderStatus
        ) {
            dataWithMetadata.statusHistory = [
                ...(formattedData.statusHistory || []),
                {
                    status: formattedData.orderStatus,
                    timestamp: new Date().toISOString(),
                    note: `Status updated by ${CURRENT_USER}`
                }
            ];
        }

        // Call the API directly with properly formatted data
        updateOrderMutation.mutate({
            id: orderId,
            data: dataWithMetadata
        });
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setAuth(null);
        toast.info("You have been logged out");
        navigate("/");
    };

    // Function to format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    // Check if order is recent (less than 24 hours old)
    const isRecentOrder = (dateString) => {
        if (!dateString) return false;
        const orderDate = new Date(dateString);
        const now = new Date();
        return now - orderDate < 24 * 60 * 60 * 1000;
    };

    // Get shortened order ID
    const getShortOrderId = (id) => {
        if (!id) return "N/A";
        return id.substring(id.length - 8).toUpperCase();
    };

    // Sidebar toggle function
    const toggleSidebar = () => {
        setSidebarVisible((prev) => !prev);
    };

    return (
        <div className={styles.dashboardContainer}>
            <Tabs defaultValue="products" className={styles.tabs}>
                <div
                    className={`${styles.layout} ${
                        sidebarVisible ? "" : styles.sidebarCollapsed
                    }`}
                >
                    {/* Sidebar toggle button for mobile */}
                    <button
                        className={styles.sidebarToggle}
                        onClick={toggleSidebar}
                        aria-label={
                            sidebarVisible ? "Hide sidebar" : "Show sidebar"
                        }
                    >
                        {sidebarVisible ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Sidebar with conditional visibility class */}
                    <div
                        className={`${styles.sidebar} ${
                            sidebarVisible ? "" : styles.hidden
                        }`}
                    >
                        {/* Existing sidebar content */}
                        <div className={styles.sidebarHeader}>
                            <div className={styles.userInfo}>
                                <h2>Admin: </h2>
                                <span>{CURRENT_USER}</span> <br />
                            </div>
                        </div>
                        <TabsList className={styles.tabsList}>
                            <TabsTrigger
                                value="products"
                                className={styles.tabsTrigger}
                            >
                                <Package className={styles.icon} /> Products
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                className={styles.tabsTrigger}
                            >
                                <Users className={styles.icon} /> Users
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className={styles.tabsTrigger}
                            >
                                <ShoppingBag className={styles.icon} /> Orders
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Main content */}
                    <div className={styles.mainContent}>
                        {/* Your existing header */}
                        <header className={styles.header}>
                            {/* Add toggle button to header for desktop */}
                            <div className={styles.headerLeft}>
                                <button
                                    className={styles.desktopSidebarToggle}
                                    onClick={toggleSidebar}
                                >
                                    <Menu size={18} />
                                </button>
                                <h1>Dashboard</h1>
                            </div>

                            {/* Existing actions */}
                            <div className={styles.actions}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Settings className={styles.icon} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            style={{ cursor: "pointer" }}
                                            onClick={handleLogout}
                                        >
                                            <LogOut className={styles.icon} />{" "}
                                            Logout
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate("/")}
                                        >
                                            <LogOut className={styles.icon} />
                                            Back to Home Page
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </header>

                        {/* Existing main content */}
                        <main className={styles.content}>
                            <TabsContent value="products">
                                <DataTable
                                    type="shoes"
                                    columns={[
                                        {
                                            header: "Image 1",
                                            accessorKey: "fSrc",
                                            cell: (item) => (
                                                <Avatar>
                                                    <AvatarImage
                                                        src={item.fSrc || ""}
                                                        alt={item.name}
                                                    />
                                                    <AvatarFallback>
                                                        {item?.name?.[0] || "P"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )
                                        },
                                        {
                                            header: "Image 2",
                                            accessorKey: "sSrc",
                                            cell: (item) => (
                                                <Avatar>
                                                    <AvatarImage
                                                        src={item.sSrc || ""}
                                                        alt={item.name}
                                                    />
                                                    <AvatarFallback>
                                                        {item?.name?.[0] || "P"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )
                                        },
                                        { header: "Name", accessorKey: "name" },
                                        {
                                            header: "Brand",
                                            accessorKey: "brand"
                                        },
                                        {
                                            header: "Price",
                                            accessorKey: "price",
                                            cell: (item) => `$${item.price}`
                                        },
                                        {
                                            header: "Sizes",
                                            accessorKey: "size",
                                            cell: (item) =>
                                                Array.isArray(item.sizes)
                                                    ? item.sizes.join(", ")
                                                    : "N/A"
                                        }
                                    ]}
                                    searchField="name"
                                    onAdd={handleAddProduct}
                                    onUpdate={handleUpdateProduct}
                                />
                            </TabsContent>

                            <TabsContent value="users">
                                <DataTable
                                    type="users"
                                    columns={[
                                        { header: "Name", accessorKey: "name" },
                                        {
                                            header: "Email",
                                            accessorKey: "email"
                                        },
                                        {
                                            header: "Phone",
                                            accessorKey: "phone"
                                        },
                                        {
                                            header: "Role",
                                            accessorKey: "roleId",
                                            cell: (item) =>
                                                item.roleId === 1
                                                    ? "User"
                                                    : "Admin"
                                        }
                                    ]}
                                    searchField="name"
                                    onAdd={handleAddUser}
                                    onUpdate={handleUpdateUser}
                                />
                            </TabsContent>

                            <TabsContent value="orders">
                                {/* First, create a simple metrics row showing order stats */}
                                <div className={styles.orderMetricsRow}>
                                    <div className={styles.metricCard}>
                                        <span className={styles.metricValue}>
                                            {orderTotalItems}
                                        </span>
                                        <span className={styles.metricLabel}>
                                            Total Orders
                                        </span>
                                    </div>
                                    <div className={styles.metricCard}>
                                        <span className={styles.metricValue}>
                                            {
                                                orders.filter(
                                                    (o) =>
                                                        o.orderStatus ===
                                                        "Processing"
                                                ).length
                                            }
                                        </span>
                                        <span className={styles.metricLabel}>
                                            Processing
                                        </span>
                                    </div>
                                    <div className={styles.metricCard}>
                                        <span className={styles.metricValue}>
                                            {
                                                orders.filter(
                                                    (o) =>
                                                        o.orderStatus ===
                                                        "Shipped"
                                                ).length
                                            }
                                        </span>
                                        <span className={styles.metricLabel}>
                                            Shipped
                                        </span>
                                    </div>
                                    <div className={styles.metricCard}>
                                        <span className={styles.metricValue}>
                                            {
                                                orders.filter(
                                                    (o) =>
                                                        o.orderStatus ===
                                                        "Delivered"
                                                ).length
                                            }
                                        </span>
                                        <span className={styles.metricLabel}>
                                            Delivered
                                        </span>
                                    </div>
                                </div>

                                {/* Use the DataTable with orders array */}
                                <DataTable
                                    type="orders"
                                    data={orders} // Pass the orders array directly
                                    columns={[
                                        {
                                            header: "Order ID",
                                            accessorKey: "_id",
                                            cell: (order) => (
                                                <div
                                                    className={
                                                        styles.orderIdCell
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.orderId
                                                        }
                                                    >
                                                        {getShortOrderId(
                                                            order._id
                                                        )}
                                                    </span>
                                                    {isRecentOrder(
                                                        order.orderedAt
                                                    ) && (
                                                        <span
                                                            className={
                                                                styles.newBadge
                                                            }
                                                        >
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Items",
                                            accessorKey: "items",
                                            cell: (order) => (
                                                <div
                                                    className={styles.itemsCell}
                                                >
                                                    <Package
                                                        size={16}
                                                        className={styles.icon}
                                                    />
                                                    <span>
                                                        {order.items?.length ||
                                                            0}{" "}
                                                        items
                                                    </span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Total",
                                            accessorKey: "finalAmount",
                                            cell: (order) => (
                                                <div
                                                    className={
                                                        styles.amountCell
                                                    }
                                                >
                                                    <DollarSign
                                                        size={16}
                                                        className={styles.icon}
                                                    />
                                                    <span
                                                        className={
                                                            styles.amount
                                                        }
                                                    >
                                                        $
                                                        {(
                                                            order.finalAmount ||
                                                            0
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Payment",
                                            accessorKey: "paymentStatus",
                                            cell: (order) => (
                                                <div
                                                    className={`${
                                                        styles.statusCell
                                                    } ${
                                                        styles[
                                                            order.paymentStatus?.toLowerCase() ||
                                                                "pending"
                                                        ]
                                                    }`}
                                                >
                                                    <CreditCard
                                                        size={16}
                                                        className={styles.icon}
                                                    />
                                                    <span>
                                                        {order.paymentStatus ||
                                                            "Pending"}
                                                    </span>
                                                </div>
                                            )
                                        },
                                        {
                                            header: "Status",
                                            accessorKey: "orderStatus",
                                            cell: (order) => {
                                                const status =
                                                    order.orderStatus ||
                                                    "Processing";
                                                return (
                                                    <div
                                                        className={`${
                                                            styles.statusCell
                                                        } ${
                                                            styles[
                                                                status.toLowerCase()
                                                            ]
                                                        }`}
                                                    >
                                                        {status ===
                                                            "Processing" && (
                                                            <Clock
                                                                size={16}
                                                                className={
                                                                    styles.icon
                                                                }
                                                            />
                                                        )}
                                                        {status ===
                                                            "Shipped" && (
                                                            <Truck
                                                                size={16}
                                                                className={
                                                                    styles.icon
                                                                }
                                                            />
                                                        )}
                                                        {status ===
                                                            "Delivered" && (
                                                            <Package
                                                                size={16}
                                                                className={
                                                                    styles.icon
                                                                }
                                                            />
                                                        )}
                                                        {status ===
                                                            "Cancelled" && (
                                                            <AlertCircle
                                                                size={16}
                                                                className={
                                                                    styles.icon
                                                                }
                                                            />
                                                        )}
                                                        <span>{status}</span>
                                                    </div>
                                                );
                                            }
                                        },
                                        {
                                            header: "Date",
                                            accessorKey: "orderedAt",
                                            cell: (order) => (
                                                <div
                                                    className={styles.dateCell}
                                                >
                                                    <Clock
                                                        size={16}
                                                        className={styles.icon}
                                                    />
                                                    <span>
                                                        {formatDate(
                                                            order.orderedAt
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        }
                                    ]}
                                    searchField="_id"
                                    onView={handleViewOrder}
                                    onUpdate={handleUpdateOrder}
                                />

                                {/* Add pagination controls */}
                                <div className={styles.paginationContainer}>
                                    <div className={styles.paginationInfo}>
                                        Showing {orders.length} of{" "}
                                        {orderTotalItems} orders
                                    </div>
                                    <div className={styles.paginationControls}>
                                        <button
                                            onClick={() => setOrderPage(1)}
                                            disabled={orderPage === 1}
                                            className={styles.paginationButton}
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() =>
                                                setOrderPage((p) =>
                                                    Math.max(1, p - 1)
                                                )
                                            }
                                            disabled={orderPage === 1}
                                            className={styles.paginationButton}
                                        >
                                            Previous
                                        </button>
                                        <span className={styles.pageIndicator}>
                                            Page {orderPage} of{" "}
                                            {orderTotalPages}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setOrderPage((p) =>
                                                    p < orderTotalPages
                                                        ? p + 1
                                                        : p
                                                )
                                            }
                                            disabled={
                                                orderPage >= orderTotalPages
                                            }
                                            className={styles.paginationButton}
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() =>
                                                setOrderPage(orderTotalPages)
                                            }
                                            disabled={
                                                orderPage === orderTotalPages
                                            }
                                            className={styles.paginationButton}
                                        >
                                            Last
                                        </button>
                                    </div>
                                    <div className={styles.pageSizeSelector}>
                                        <label>Show per page:</label>
                                        <select
                                            value={orderPageSize}
                                            onChange={(e) => {
                                                setOrderPageSize(
                                                    Number(e.target.value)
                                                );
                                                setOrderPage(1); // Reset to first page when changing page size
                                            }}
                                            className={styles.pageSizeSelect}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                            </TabsContent>
                        </main>
                    </div>
                </div>
            </Tabs>

            {/* Keep existing forms */}
            <ProductForm
                open={productFormOpen}
                onOpenChange={setProductFormOpen}
                onSubmit={handleSubmitProduct}
                isSubmitting={
                    isSubmitting ||
                    createProductMutation.isPending ||
                    updateProductMutation.isPending
                }
                initialData={editingProduct}
                isEditing={!!editingProduct}
            />
            <ProductFormUpdate
                open={updateFormOpen}
                onOpenChange={setUpdateFormOpen}
                onUpdate={(updatedProduct) => {
                    // Handle the updated product if needed
                    console.log("Product updated:", updatedProduct);
                }}
                isSubmitting={isSubmitting}
                product={selectedProduct}
            />

            <UserForm
                open={userFormOpen}
                onOpenChange={setUserFormOpen}
                onSubmit={handleSubmitUser}
                isSubmitting={
                    isSubmitting ||
                    createUserMutation.isPending ||
                    updateUserMutation.isPending
                }
                initialData={editingUser}
                isEditing={!!editingUser}
            />
            <UserUpdateForm
                open={updateUserFormOpen}
                onOpenChange={setUpdateUserFormOpen}
                onSubmit={handleUserUpdate}
                isSubmitting={updateUserMutation.isPending}
                userData={selectedUser}
            />

            <OrderUpdateForm
                open={orderUpdateOpen}
                onOpenChange={setOrderUpdateOpen}
                onSubmit={handleSubmitOrderUpdate}
                isSubmitting={updateOrderMutation.isPending}
                orderData={selectedOrder}
            />
        </div>
    );
}
