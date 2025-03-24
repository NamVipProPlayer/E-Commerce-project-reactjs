import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useNavigation = (currentFilters = {}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Memoize filters to prevent unnecessary updates
    const filters = useMemo(() => currentFilters || {}, [currentFilters]);

    const handleNavigation = useCallback(
        (path, mergeFilters = false) => {
            try {
                const previousState = location.state || {};
                const navigationState = {
                    previousPath: location.pathname,
                    filters: mergeFilters
                        ? { ...previousState.filters, ...filters }
                        : filters
                };

                navigate(path, {
                    state: navigationState,
                    replace: location.pathname === path
                });
            } catch (error) {
                console.error("Navigation failed:", error);
            }
        },
        [navigate, location, filters]
    );

    const goBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return { handleNavigation, goBack };
};
