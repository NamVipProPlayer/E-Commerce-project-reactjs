import ProductGrid from "@component/ProductGrid/ProductGrid.jsx";
import { Button } from "@component/ui/Button/Button.jsx";
import shoesProductService from "@/apis/shoesProductService";
import styles from "./stylesOurPage.module.scss";
import Sidebarss from "@component/SideBarOurPage/SideBar";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Added import for useLocation
import MainLayout from "@component/Layout/Layout";

export default function OurPage() {
    const location = useLocation(); // Get location object for accessing state
    const [currentPage, setCurrentPage] = useState(1);

    // Initialize filters with category from navigation state if available
    const [filters, setFilters] = useState(() => {
        const categoryFromState = location.state?.category;
        return {
            category: categoryFromState ? [categoryFromState] : [],
            price: null,
            colorSearch: ""
        };
    });

    const ITEMS_PER_PAGE = 12;

    // For debugging: log category from state
    useEffect(() => {
        if (location.state?.category) {
            console.log(
                "Category from navigation state:",
                location.state.category
            );
        }
    }, [location.state]);

    // Fetch products
    const { data: products = [], isLoading } = useQuery({
        queryKey: ["shoesProducts"],
        queryFn: async () => {
            const response = await shoesProductService.getAllShoesProducts();
            return response;
        },
        staleTime: 5 * 60 * 1000
    });

    // Handle navigation state changes
    useEffect(() => {
        const categoryFromState = location.state?.category;
        if (categoryFromState) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                category: [categoryFromState]
            }));
            // Reset to first page when category changes
            setCurrentPage(1);
        }
    }, [location.state]);

    // Deduplicate and filter products
    const uniqueProducts = Array.from(
        new Map(products.map((item) => [item._id, item])).values()
    );

    // Apply filters
    const filteredProducts = uniqueProducts
        .filter((product) => {
            // Category filter
            if (
                filters.category.length > 0 &&
                !filters.category.includes(product.category)
            ) {
                return false;
            }
            // Color filter (search)
            if (
                filters.colorSearch.trim() !== "" &&
                !product.colors.some((color) =>
                    color
                        .toLowerCase()
                        .includes(filters.colorSearch.toLowerCase())
                )
            ) {
                return false;
            }
            return true;
        })
        // Sort by price
        .sort((a, b) => {
            if (filters.price === "desc") return b.price - a.price;
            if (filters.price === "asc") return a.price - b.price;
            return 0;
        });

    // Update total pages dynamically
    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    );

    // Reset current page if it exceeds total pages
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    // Pagination Logic
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Footer information display
    const currentDateTime = "2025-03-10 03:54:07";
    const currentUser = "NamProPlayer20";

    return (
        <MainLayout>
            <div className={styles.container}>
                <Sidebarss
                    onFilterChange={setFilters}
                    initialCategory={location.state?.category}
                />
                <div className={styles.mainContent}>
                    {filters.category.length > 0 && (
                        <div className={styles.activeFilters}>
                            <h2>
                                {filters.category[0]} Shoes
                                <span className={styles.resultCount}>
                                    ({filteredProducts.length} results)
                                </span>
                            </h2>
                        </div>
                    )}

                    <ProductGrid
                        products={paginatedProducts}
                        isLoading={isLoading}
                    />

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}

                   
                </div>
            </div>
        </MainLayout>
    );
}
