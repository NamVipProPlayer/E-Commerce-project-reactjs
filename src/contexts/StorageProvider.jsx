import { createContext, useEffect, useState } from "react";
import userService from "@/apis/userService";

// Create the context with a default value to prevent undefined errors
export const StorageContext = createContext({
    userInfo: null,
    setUserInfo: () => {},
    handleLogOut: () => {}
});

export const StorageProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const storedUserId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");

    const handleLogOut = () => {
        setUserInfo(null);
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
    };

    useEffect(() => {
        // Set loading state
        setIsLoading(true);

        if (storedUserId) {
            userService
                .getProfile()
                .then((res) => {
                    setUserInfo(res);
                    console.log("User profile loaded successfully:", res);
                })
                .catch((err) => {
                    console.error("Error fetching user profile:", err);
                    // Handle error - you might want to clear invalid userId
                    if (err.response?.status === 401) {
                        localStorage.removeItem("userId");
                        sessionStorage.removeItem("userId");
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    // Provide context value
    const contextValue = {
        userInfo,
        setUserInfo,
        handleLogOut,
        isLoading
    };

    return (
        <StorageContext.Provider value={contextValue}>
            {children}
        </StorageContext.Provider>
    );
};

export default StorageProvider;
