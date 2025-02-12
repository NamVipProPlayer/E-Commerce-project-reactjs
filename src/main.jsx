import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@styles/_main.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Shop from "@component/Shop/Shop.jsx";

const routers = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/shop",
        element: <Shop />
    }
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={routers} />
    </StrictMode>
);
