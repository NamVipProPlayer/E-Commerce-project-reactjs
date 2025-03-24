import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import Shop from "@component/Shop/Shop.jsx";
import Dashboard from "@component/Admin/Dashboard.jsx";
import "@styles/_main.scss";

import { SideBarProvider } from "@Contexts/SideBarProvider.jsx";
import SideBar from "@component/SideBar/SideBar.jsx";
import RegisterPage from "@component/SideBarContent/RegisterUI/RegisterPage.jsx";
import { AuthProvider } from "@Contexts/AuthContext.jsx";
import { StorageProvider } from "@Contexts/StorageProvider.jsx";
import OurPage from "@component/OurPage/OurPage.jsx";
import Layout from "@component/Layout/Layout.jsx";
import ProductDetail from "@component/ProductDetail/ProductDetail.jsx";
import CheckoutPage from "@component/CheckOutPage/CheckOutPage.jsx";
import TransactionSuccess from "@component/TransactionSuccess/TransactionSuccess.jsx";
import OrderDetails from "@component/OrderManager/OrderDetail.jsx";
import OrdersPage from "@component/OrderManager/OrderPage.jsx";
import Profile from "@component/Profile/Profile.jsx";
import ChangePassword from "@component/Profile/ChangePassword/ChangePassword.jsx";

// Create a query client
const queryClient = new QueryClient();

// Define Routes
const routers = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <SideBar /> 
                <App />
            </>
        )
    },
    {
        path: "/shop",
        element: (
            <>
                <SideBar />
                <Shop />
            </>
        )
    },
    {
        path: "/admin",
        element: (
            <>
                <Dashboard />
            </>
        )
    },
    {
        path: "/register",
        element: (
            <>
                <RegisterPage />
            </>
        )
    },
    {
        path: "/OurStore",
        element: (
            <>
                <SideBar />
                <OurPage />
            </>
        )
    },
    {
        path: "/product/:id",
        element: (
            <Layout>
                <SideBar />
                <ProductDetail />
            </Layout>
        )
    },
    {
        path: "/CheckOut",
        element: <CheckoutPage />
    },
    {
        path: "/order/vnpay_return",
        element: <TransactionSuccess />
    },
    {
        path: "/account/orders",
        element: (
            <Layout>
                <SideBar />
                <OrdersPage />
            </Layout>
        )
    },
    {
        path: "/account/orders/:id",
        element: (
            <Layout>
                <SideBar />
                <OrderDetails />
            </Layout>
        )
    },
    {
        path: "/account/profile",
        element: (
            <Layout>
                <SideBar />
                <Profile />
            </Layout>
        )
    },
    { path: "/account/change-password",
        element: (
            <ChangePassword />
        )
     }
]);

createRoot(document.getElementById("root")).render(
    <StorageProvider>
        <StrictMode>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    <SideBarProvider>
                        <RouterProvider router={routers} />
                    </SideBarProvider>
                </QueryClientProvider>
            </AuthProvider>
        </StrictMode>
    </StorageProvider>
);
