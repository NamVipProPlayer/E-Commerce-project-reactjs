import { useState, useMemo, useRef, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    SlidersHorizontal,
    User,
    Calendar
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./stylesDataTable.module.scss";
import orderService from "@apis/orderService.js";
import userService from "@/apis/userService.js";
import shoesProductService from "@/apis/shoesProductService.js";
import { StorageContext } from "@Contexts/StorageProvider";
import { getCurrentFormattedDateTime } from "@component/utils/dateTimeUtils";

export function DataTable({
    type,
    columns,
    searchField,
    onAdd,
    onUpdate,
    onView, // Add this if needed
    data: propData // Add this to accept data from parent
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    });
    const tableContainerRef = useRef(null);
    const queryClient = useQueryClient();
    const { userInfo } = useContext(StorageContext);

    // Current date/time and user info
    const currentDateTime = getCurrentFormattedDateTime();
    const currentUser = userInfo ? userInfo.name : "Undefine";

    // Scroll to top of table when page changes
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [currentPage]);

    // Use provided data or fetch with React Query
    const useProvidedData = Array.isArray(propData);

    // Data fetching with React Query - only if data prop is not provided
    const {
        data: fetchedData = [],
        isLoading: isFetchLoading,
        isError: isFetchError,
        error: fetchError,
        refetch
    } = useQuery({
        queryKey: [type],
        queryFn: async () => {
            if (useProvidedData) return []; // Skip API call if data was provided
            try {
                if (type === "users") return await userService.getUsers();
                if (type === "shoes")
                    return await shoesProductService.getAllShoesProducts();
                if (type === "orders") return await orderService.getAllOrders();
                return [];
            } catch (error) {
                console.error(`Error fetching ${type}:`, error);
                throw error;
            }
        },
        staleTime: 60000, // 1 minute before re-fetch
        enabled: !useProvidedData // Only run query if data wasn't provided
    });

    // Use either provided data or fetched data
    const data = useProvidedData ? propData : fetchedData;
    const isLoading = useProvidedData ? false : isFetchLoading;
    const isError = useProvidedData ? false : isFetchError;
    const error = useProvidedData ? null : fetchError;

    // Delete mutation with better error handling
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            if (type === "users")
                return await userService.deleteUserAdminRole(id);
            if (type === "shoes")
                return await shoesProductService.deleteShoeProduct(id);
            if (type === "orders") return await orderService.deleteOrder(id);
        },
        onSuccess: () => {
            setShowConfirmDelete(null);
            queryClient.invalidateQueries({ queryKey: [type] });
        },
        onError: (error) => {
            console.error(`Error deleting ${type}:`, error);
        }
    });

    // Handle sorting
    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    // Apply sorting and filtering
    const filteredData = useMemo(() => {
        // Ensure data is an array before attempting to spread it
        const safeData = Array.isArray(data) ? data : [];
        let filteredItems = [...safeData];

        // Apply search filtering
        if (searchQuery) {
            filteredItems = filteredItems.filter((item) =>
                String(item[searchField] || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filteredItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === "ascending" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "ascending" ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredItems;
    }, [data, searchQuery, searchField, sortConfig]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Get current page data
    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Reset to page 1 if filtering changes page count
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Handle page changes
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle delete confirmation
    const handleDelete = (id) => {
        setShowConfirmDelete(id);
    };

    // Delete confirmation modal
    const DeleteConfirmation = ({ id }) => (
        <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className={styles.confirmDialog}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <h3>Confirm Deletion</h3>
                <p>
                    Are you sure you want to delete this item? This action
                    cannot be undone.
                </p>
                <div className={styles.confirmButtons}>
                    <button
                        className={styles.cancelButton}
                        onClick={() => setShowConfirmDelete(null)}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.confirmDeleteButton}
                        onClick={() => deleteMutation.mutate(id)}
                        disabled={deleteMutation.isLoading}
                    >
                        {deleteMutation.isLoading ? (
                            <>
                                <Loader2
                                    className={styles.spinnerIcon}
                                    size={16}
                                />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Pagination component
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrentPage = Math.floor(maxVisiblePages / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxVisiblePages / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrentPage) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                    Showing{" "}
                    {filteredData.length
                        ? (currentPage - 1) * itemsPerPage + 1
                        : 0}{" "}
                    -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} {type}
                </div>
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                        aria-label="First page"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                        aria-label="Previous page"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`${styles.paginationButton} ${
                                currentPage === number ? styles.activePage : ""
                            }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                        aria-label="Next page"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                        aria-label="Last page"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    // Skeleton loader
    const TableSkeleton = () => (
        <div className={styles.tableWrapper}>
            <div className={styles.skeletonHeader}>
                {columns.map((_, i) => (
                    <div key={i} className={styles.skeletonHeaderCell} />
                ))}
                <div className={styles.skeletonHeaderCell} />
                <div className={styles.skeletonHeaderCell} />
            </div>

            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className={styles.skeletonRow}>
                    {columns.map((_, cellIndex) => (
                        <div key={cellIndex} className={styles.skeletonCell} />
                    ))}
                    <div className={styles.skeletonCell} />
                    <div className={styles.skeletonCell} />
                </div>
            ))}
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
                {searchQuery ? <Search size={40} /> : <AlertCircle size={40} />}
            </div>
            <h3>{searchQuery ? "No results found" : `No ${type} available`}</h3>
            <p>
                {searchQuery
                    ? `We couldn't find any ${type} matching "${searchQuery}"`
                    : `There are no ${type} to display. Add one to get started.`}
            </p>
            {onAdd && !searchQuery && (
                <button onClick={onAdd} className={styles.addEmptyButton}>
                    <Plus size={16} />
                    Add New{" "}
                    {type === "users"
                        ? "User"
                        : type === "shoes"
                        ? "Product"
                        : "Order"}
                </button>
            )}
            {searchQuery && (
                <button
                    onClick={() => setSearchQuery("")}
                    className={styles.clearSearchButton}
                >
                    Clear Search
                </button>
            )}
        </div>
    );

    // Get title based on type
    const getTitle = () => {
        if (type === "users") return "Users Management";
        if (type === "shoes") return "Products Management";
        if (type === "orders") return "Orders Management";
        return "Data Management";
    };

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.userInfo}>
                    <User size={16} />
                    <span>{currentUser}</span>
                </div>
                <div className={styles.dateInfo}>
                    <Calendar size={16} />
                    <span>{currentDateTime}</span>
                </div>
            </div>

            <div className={styles.header}>
                <h2 className={styles.title}>{getTitle()}</h2>
                <div className={styles.controlsWrapper}>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} />
                        <input
                            placeholder={`Search ${type}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                className={styles.clearButton}
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    {onAdd && (
                        <motion.button
                            onClick={onAdd}
                            className={styles.addButton}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Plus className={styles.addIcon} />
                            <span>
                                Add New{" "}
                                {type === "users"
                                    ? "User"
                                    : type === "shoes"
                                    ? "Product"
                                    : "Order"}
                            </span>
                        </motion.button>
                    )}
                </div>
            </div>

            {isError ? (
                <div className={styles.errorState}>
                    <AlertCircle size={32} />
                    <h3>Failed to load data</h3>
                    <p>
                        {error?.message ||
                            `There was an error loading the ${type}.`}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className={styles.retryButton}
                    >
                        Try Again
                    </button>
                </div>
            ) : isLoading ? (
                <TableSkeleton />
            ) : filteredData.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <div
                        className={styles.tableContainer}
                        ref={tableContainerRef}
                    >
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr className={styles.tableHeader}>
                                        {columns.map((column) => (
                                            <th
                                                key={String(column.accessorKey)}
                                                className={
                                                    styles.tableHeaderCell
                                                }
                                                onClick={() =>
                                                    column.sortable !== false &&
                                                    requestSort(
                                                        column.accessorKey
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.headerContent
                                                    }
                                                >
                                                    <span>{column.header}</span>
                                                    {sortConfig.key ===
                                                        column.accessorKey && (
                                                        <span
                                                            className={
                                                                styles.sortIcon
                                                            }
                                                        >
                                                            {sortConfig.direction ===
                                                            "ascending"
                                                                ? " ↑"
                                                                : " ↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        <th className={styles.tableHeaderCell}>
                                            Update
                                        </th>
                                        <th className={styles.tableHeaderCell}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className={styles.tbody}>
                                    {currentData.map((item, index) => (
                                        <motion.tr
                                            key={item._id}
                                            className={styles.tableRow}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: index * 0.05
                                            }}
                                            layout
                                        >
                                            {columns.map((column) => (
                                                <td
                                                    key={String(
                                                        column.accessorKey
                                                    )}
                                                    className={styles.tableCell}
                                                >
                                                    {column.cell
                                                        ? column.cell(item)
                                                        : String(
                                                              item[
                                                                  column
                                                                      .accessorKey
                                                              ] || ""
                                                          )}
                                                </td>
                                            ))}
                                            <td className={styles.tableCell}>
                                                <motion.button
                                                    onClick={() =>
                                                        onUpdate?.(item)
                                                    }
                                                    className={
                                                        styles.updateButton
                                                    }
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Edit size={15} />
                                                    <span>Edit</span>
                                                </motion.button>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <motion.button
                                                    onClick={() =>
                                                        handleDelete(item._id)
                                                    }
                                                    className={
                                                        styles.deleteButton
                                                    }
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={!item._id}
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Delete</span>
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <Pagination />
                </>
            )}

            <AnimatePresence>
                {showConfirmDelete && (
                    <DeleteConfirmation id={showConfirmDelete} />
                )}
            </AnimatePresence>
        </div>
    );
}
