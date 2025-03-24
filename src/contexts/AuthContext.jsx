import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        // Check localStorage or sessionStorage for existing token on page load
        const token =
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken");
        if (token) {
            setAuth({ token }); // You can expand this to fetch user details
        }
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
