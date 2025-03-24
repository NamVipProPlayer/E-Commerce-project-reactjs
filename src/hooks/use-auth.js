// import { createContext, useContext } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
// import { useToast } from "@/hooks/use-toast";

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//     const { toast } = useToast();
//     const {
//         data: user,
//         error,
//         isLoading
//     } = useQuery({
//         queryKey: ["/api/user"],
//         queryFn: getQueryFn({ on401: "returnNull" })
//     });

//     const loginMutation = useMutation({
//         mutationFn: async (credentials) => {
//             const res = await apiRequest("POST", "/api/login", credentials);
//             return await res.json();
//         },
//         onSuccess: (user) => {
//             queryClient.setQueryData(["/api/user"], user);
//         },
//         onError: (error) => {
//             toast({
//                 title: "Login failed",
//                 description: error.message,
//                 variant: "destructive"
//             });
//         }
//     });

//     const registerMutation = useMutation({
//         mutationFn: async (credentials) => {
//             const res = await apiRequest("POST", "/api/register", credentials);
//             return await res.json();
//         },
//         onSuccess: (user) => {
//             queryClient.setQueryData(["/api/user"], user);
//         },
//         onError: (error) => {
//             toast({
//                 title: "Registration failed",
//                 description: error.message,
//                 variant: "destructive"
//             });
//         }
//     });

//     const logoutMutation = useMutation({
//         mutationFn: async () => {
//             await apiRequest("POST", "/api/logout");
//         },
//         onSuccess: () => {
//             queryClient.setQueryData(["/api/user"], null);
//         },
//         onError: (error) => {
//             toast({
//                 title: "Logout failed",
//                 description: error.message,
//                 variant: "destructive"
//             });
//         }
//     });

//     return (
//         <AuthContext.Provider
//             value={{
//                 user: user ?? null,
//                 isLoading,
//                 error,
//                 loginMutation,
//                 logoutMutation,
//                 registerMutation
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// }
