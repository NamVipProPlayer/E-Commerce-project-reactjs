
import {
    useState,
    useEffect,
    useContext,
    useCallback,
    createContext
} from "react";
import { AuthContext } from "@Contexts/AuthContext";
import cartService from "@apis/cartService";
import wishlistService from "@apis/wishlistService";

// Create a context for the counts
export const CountsContext = createContext();

// Create a provider component
export function CountsProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const { auth } = useContext(AuthContext);
    const isAuthenticated = !!auth?.token;

    // Fetch both cart and wishlist counts
    const fetchCounts = useCallback(async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            setWishlistCount(0);
            return { cart: 0, wishlist: 0 };
        }

        setIsLoading(true);
        try {
            // Fetch cart count
            const cartResponse = await cartService.getCart();
            const newCartCount =
                cartResponse && cartResponse.items
                    ? cartResponse.items.length
                    : 0;
            setCartCount(newCartCount);

            // Fetch wishlist count
            const wishlistResponse = await wishlistService.getWishlist();
            let newWishlistCount = 0;

            // Handle different response formats
            if (
                wishlistResponse &&
                wishlistResponse.products &&
                Array.isArray(wishlistResponse.products)
            ) {
                newWishlistCount = wishlistResponse.products.length;
            } else if (wishlistResponse && Array.isArray(wishlistResponse)) {
                newWishlistCount = wishlistResponse.length;
            } else {
                console.warn("Unexpected wishlist format:", wishlistResponse);
            }

            setWishlistCount(newWishlistCount);
            setLastUpdated(new Date());

            return { cart: newCartCount, wishlist: newWishlistCount };
        } catch (error) {
            console.error("Error fetching counts:", error);
            return { cart: cartCount, wishlist: wishlistCount, error };
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Helper methods to manually update counts
    const incrementCartCount = () => setCartCount((prev) => prev + 1);
    const decrementCartCount = () =>
        setCartCount((prev) => Math.max(0, prev - 1));
    const incrementWishlistCount = () => setWishlistCount((prev) => prev + 1);
    const decrementWishlistCount = () =>
        setWishlistCount((prev) => Math.max(0, prev - 1));
    const setCustomCartCount = (count) => setCartCount(Math.max(0, count));
    const setCustomWishlistCount = (count) =>
        setWishlistCount(Math.max(0, count));

    // Fetch counts when auth state changes
    useEffect(() => {
        fetchCounts();

        // Setup interval for auto-refresh
        const intervalId = setInterval(fetchCounts, 60000);

        // Cleanup interval on unmount
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isAuthenticated, fetchCounts]);

    const value = {
        cartCount,
        wishlistCount,
        isLoading,
        lastUpdated,
        fetchCounts,
        incrementCartCount,
        decrementCartCount,
        incrementWishlistCount,
        decrementWishlistCount,
        setCartCount: setCustomCartCount,
        setWishlistCount: setCustomWishlistCount
    };

    return (
        <CountsContext.Provider value={value}>
            {children}
        </CountsContext.Provider>
    );
}

// Create a custom hook to use the context
export default function useCountsFetcher() {
    const context = useContext(CountsContext);
    if (context === undefined) {
        throw new Error(
            "useCountsFetcher must be used within a CountsProvider"
        );
    }
    return context;
}
